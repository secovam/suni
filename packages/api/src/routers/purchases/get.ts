import { purchaseIdSchema } from "@suni/db/validation/purchase-orders";

import { adminProcedure } from "../../index";
import { orderTotal, summarizePurchase } from "./totals";

export const get = adminProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(purchaseIdSchema)
  .handler(async ({ input: { id }, context, errors }) => {
    const found = await context.db.query.purchase.findFirst({
      where: { id },
      with: {
        orders: { orderBy: { supplierName: "asc" }, with: { items: true } },
      },
    });

    if (!found) {
      const order = await context.db.query.purchaseOrder.findFirst({
        where: { id },
        with: { items: true },
      });

      if (!order) {
        throw errors.NOT_FOUND({ message: "La orden de compra no existe" });
      }

      return {
        scope: "supplierOrder" as const,
        ...order,
        total: orderTotal(order.items),
      };
    }

    return {
      scope: "purchase" as const,
      ...found,
      ...summarizePurchase(found.orders),
      orders: found.orders.map((order) => ({
        ...order,
        total: orderTotal(order.items),
      })),
    };
  });
