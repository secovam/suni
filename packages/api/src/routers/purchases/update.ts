import { ORPCError } from "@orpc/server";
import { purchase, purchaseOrder } from "@suni/db/schema/purchase-orders";
import { purchaseUpdateSchema } from "@suni/db/validation/purchase-orders";
import { and, desc, eq, inArray, ne, or } from "drizzle-orm";

import type { Context } from "../../context";
import { adminProcedure } from "../../index";
import { savePurchase } from "./create";

function cancelPurchase(context: Context & { userId: string }, id: string) {
  return context.db.transaction(async (tx) => {
    const [current] = await tx
      .select({ id: purchase.id, status: purchase.status })
      .from(purchase)
      .where(
        or(
          eq(purchase.id, id),
          inArray(
            purchase.id,
            tx
              .select({ id: purchaseOrder.purchaseId })
              .from(purchaseOrder)
              .where(eq(purchaseOrder.id, id))
          )
        )
      )
      .orderBy(desc(eq(purchase.id, id)))
      .limit(1)
      .for("update");

    if (!current) {
      throw new ORPCError("NOT_FOUND", {
        message: "La orden de compra no existe",
      });
    }

    const individual = current.id !== id;

    if (individual) {
      if (current.status === "draft") {
        throw new ORPCError("CONFLICT", {
          message: "Edita la compra en borrador para quitar un proveedor",
        });
      }

      const order = await tx.query.purchaseOrder.findFirst({
        where: { id, purchaseId: current.id },
        columns: { status: true },
      });

      if (!order) {
        throw new ORPCError("NOT_FOUND", {
          message: "La orden de compra no existe",
        });
      }

      if (order.status === "cancelled") {
        return { id };
      }
    }

    if (current.status === "cancelled") {
      return { id };
    }

    const cancelledAt = new Date();

    await tx
      .update(purchaseOrder)
      .set({ status: "cancelled", cancelledAt })
      .where(
        and(
          eq(purchaseOrder.purchaseId, current.id),
          ne(purchaseOrder.status, "cancelled"),
          individual ? eq(purchaseOrder.id, id) : undefined
        )
      );

    const remaining = individual
      ? await tx.query.purchaseOrder.findFirst({
          where: { purchaseId: current.id, status: { ne: "cancelled" } },
          columns: { id: true },
        })
      : undefined;

    await tx
      .update(purchase)
      .set({
        modifiedBy: context.userId,
        status: remaining ? current.status : "cancelled",
        cancelledAt: remaining ? undefined : cancelledAt,
      })
      .where(eq(purchase.id, current.id));

    return { id };
  });
}

export const update = adminProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(purchaseUpdateSchema)
  .handler(({ input, context }) => {
    if ("items" in input) {
      return savePurchase(context, input, input.id);
    }

    const { id, status } = input;

    if (status === "cancelled") {
      return cancelPurchase(context, id);
    }

    const expected = status === "sent" ? "generated" : "sent";

    return context.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(purchase)
        .set({ status, modifiedBy: context.userId })
        .where(and(eq(purchase.id, id), eq(purchase.status, expected)))
        .returning({ id: purchase.id });

      if (!updated) {
        throw new ORPCError("CONFLICT", {
          message:
            status === "sent"
              ? "Solo se pueden marcar como enviadas las compras generadas"
              : "Solo se pueden confirmar las compras enviadas",
        });
      }

      await tx
        .update(purchaseOrder)
        .set({ status })
        .where(
          and(
            eq(purchaseOrder.purchaseId, id),
            eq(purchaseOrder.status, expected)
          )
        );

      return updated;
    });
  });
