import { purchase, purchaseOrder } from "@suni/db/schema/purchase-orders";
import { purchaseTargetSchema } from "@suni/db/validation/purchase-orders";
import { and, eq, inArray, ne } from "drizzle-orm";

import { adminProcedure } from "../../index";

export const cancel = adminProcedure
  .route({ method: "POST", path: "/{id}/cancel" })
  .input(purchaseTargetSchema)
  .handler(({ input: { id, scope }, context, errors }) =>
    context.db.transaction(async (tx) => {
      const individual = scope === "supplierOrder";

      const parentFilter = individual
        ? inArray(
            purchase.id,
            tx
              .select({ id: purchaseOrder.purchaseId })
              .from(purchaseOrder)
              .where(eq(purchaseOrder.id, id))
          )
        : eq(purchase.id, id);

      const [current] = await tx
        .select({ id: purchase.id, status: purchase.status })
        .from(purchase)
        .where(parentFilter)
        .for("update");

      if (!current) {
        throw errors.NOT_FOUND({
          message: individual
            ? "La orden de compra no existe"
            : "La compra no existe",
        });
      }

      if (individual) {
        const order = await tx.query.purchaseOrder.findFirst({
          where: { id, purchaseId: current.id },
          columns: { status: true },
        });

        if (!order) {
          throw errors.NOT_FOUND({ message: "La orden de compra no existe" });
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
          status: remaining ? "confirmed" : "cancelled",
          cancelledAt: remaining ? undefined : cancelledAt,
        })
        .where(eq(purchase.id, current.id));

      return { id };
    })
  );
