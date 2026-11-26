import { purchaseTargetSchema } from "@suni/db/validation/purchase-orders";

import { adminProcedure } from "../../index";
import { orderTotal, summarizePurchase } from "./totals";

export const get = adminProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(purchaseTargetSchema)
  .handler(async ({ input: { id, scope }, context, errors }) => {
    if (scope === "supplierOrder") {
      const order = await context.db.query.purchaseOrder.findFirst({
        where: { id },
        with: { items: true },
      });

      if (!order) {
        throw errors.NOT_FOUND({ message: "La orden de compra no existe" });
      }

      return { scope, ...order, total: orderTotal(order.items) };
    }

    const found = await context.db.query.purchase.findFirst({
      where: { id },
      with: {
        orders: { orderBy: { supplierName: "asc" }, with: { items: true } },
      },
    });

    if (!found) {
      throw errors.NOT_FOUND({ message: "La compra no existe" });
    }

    return {
      scope,
      ...found,
      ...summarizePurchase(found.orders),
      orders: found.orders.map((order) => ({
        ...order,
        total: orderTotal(order.items),
      })),
    };
  });
