import { ORPCError } from "@orpc/server";
import { ingredient } from "@suni/db/schema/ingredients";
import {
  purchase,
  purchaseOrder,
  purchaseOrderItem,
} from "@suni/db/schema/purchase-orders";
import { supplier } from "@suni/db/schema/suppliers";
import { purchaseCreateSchema } from "@suni/db/validation/purchase-orders";
import { and, eq, inArray, isNull } from "drizzle-orm";

import { adminProcedure } from "../../index";

export const create = adminProcedure
  .route({ method: "POST", path: "/" })
  .input(purchaseCreateSchema)
  .handler(({ input: { items, notes }, context }) =>
    context.db.transaction(async (tx) => {
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

      const [created] = await tx
        .insert(purchase)
        .values({
          folio: `CG-${crypto.randomUUID()}`,
          notes,
          createdBy: context.userId,
          modifiedBy: context.userId,
        })
        .returning({ id: purchase.id });

      if (!created) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "No se pudo crear la compra",
        });
      }

      const bySupplier = new Map(
        catalog.map((entry) => [entry.supplierId, entry])
      );

      const orders = await tx
        .insert(purchaseOrder)
        .values(
          [...bySupplier.values()].map((entry) => ({
            folio: `OC-${crypto.randomUUID()}`,
            purchaseId: created.id,
            supplierId: entry.supplierId,
            supplierName: entry.supplierName,
            supplierRfc: entry.supplierRfc,
          }))
        )
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

      return created;
    })
  );
