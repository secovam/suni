import { ORPCError } from "@orpc/server";
import { ingredient } from "@suni/db/schema/ingredients";
import {
  purchase,
  purchaseOrder,
  purchaseOrderItem,
} from "@suni/db/schema/purchase-orders";
import { supplier } from "@suni/db/schema/suppliers";
import { purchaseCreateSchema } from "@suni/db/validation/purchase-orders";
import { and, eq, inArray, isNull, notInArray, sql } from "drizzle-orm";

import type { Context } from "../../context";
import { adminProcedure } from "../../index";

type PurchaseData = ReturnType<typeof purchaseCreateSchema.parse>;

export function savePurchase(
  context: Context & { userId: string },
  input: PurchaseData,
  draftId?: string
) {
  return context.db.transaction(async (tx) => {
    const { items, notes, status } = input;
    const updating = draftId !== undefined;
    const fields = { notes, status, modifiedBy: context.userId };

    const [saved] = updating
      ? await tx
          .update(purchase)
          .set(fields)
          .where(and(eq(purchase.id, draftId), eq(purchase.status, "draft")))
          .returning({ id: purchase.id })
      : await tx
          .insert(purchase)
          .values({
            ...fields,
            createdBy: context.userId,
            folio: `CG-${crypto.randomUUID()}`,
          })
          .returning({ id: purchase.id });

    if (!saved) {
      if (updating) {
        throw new ORPCError("CONFLICT", {
          message: "Solo se pueden editar compras en borrador",
        });
      }

      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "No se pudo crear la compra",
      });
    }

    const purchaseId = saved.id;

    const ingredientIds = [
      ...new Set(items.map(({ ingredientId }) => ingredientId)),
    ];

    const catalog = await tx
      .select({
        id: ingredient.id,
        name: ingredient.name,
        unit: ingredient.unit,
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierRfc: supplier.rfc,
      })
      .from(ingredient)
      .innerJoin(supplier, eq(ingredient.supplierId, supplier.id))
      .where(
        and(
          inArray(ingredient.id, ingredientIds),
          isNull(ingredient.archived),
          isNull(supplier.archived)
        )
      )
      .for("share");

    const byId = new Map(catalog.map((entry) => [entry.id, entry]));

    if (byId.size !== ingredientIds.length) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          "Uno o más ingredientes o proveedores no existen o están archivados",
      });
    }

    const existingOrders = updating
      ? await tx.query.purchaseOrder.findMany({
          where: { purchaseId },
          columns: { id: true },
        })
      : [];

    if (existingOrders.length > 0) {
      await tx.delete(purchaseOrderItem).where(
        inArray(
          purchaseOrderItem.purchaseOrderId,
          existingOrders.map(({ id }) => id)
        )
      );
    }

    const bySupplier = new Map(
      catalog.map((entry) => [entry.supplierId, entry])
    );

    const orders = await tx
      .insert(purchaseOrder)
      .values(
        [...bySupplier.values()].map((entry) => ({
          folio: `OC-${crypto.randomUUID()}`,
          purchaseId,
          supplierId: entry.supplierId,
          supplierName: entry.supplierName,
          supplierRfc: entry.supplierRfc,
          status,
        }))
      )
      .onConflictDoUpdate({
        target: [purchaseOrder.purchaseId, purchaseOrder.supplierId],
        set: {
          status,
          supplierName: sql`excluded.supplier_name`,
          supplierRfc: sql`excluded.supplier_rfc`,
        },
      })
      .returning({
        id: purchaseOrder.id,
        supplierId: purchaseOrder.supplierId,
      });

    const orderIds = new Map(
      orders.map(({ id, supplierId }) => [supplierId, id])
    );

    await tx.insert(purchaseOrderItem).values(
      items.map(({ ingredientId, quantity, unitPrice }) => {
        const entry = byId.get(ingredientId);
        const orderId = entry && orderIds.get(entry.supplierId);

        if (!entry || !orderId) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "No se pudo agrupar la partida por proveedor",
          });
        }

        return {
          purchaseOrderId: orderId,
          ingredientId,
          ingredientName: entry.name,
          unit: entry.unit,
          quantity,
          unitPrice,
        };
      })
    );

    if (existingOrders.length > 0) {
      await tx.delete(purchaseOrder).where(
        and(
          eq(purchaseOrder.purchaseId, purchaseId),
          notInArray(
            purchaseOrder.id,
            orders.map(({ id }) => id)
          )
        )
      );
    }

    return saved;
  });
}

export const create = adminProcedure
  .route({ method: "POST", path: "/" })
  .input(purchaseCreateSchema)
  .handler(({ input, context }) => savePurchase(context, input));
