import { purchaseListSchema } from "@suni/db/validation/purchase-orders";

import { adminProcedure } from "../../index";
import { orderTotal, summarizePurchase } from "./totals";

export const list = adminProcedure
  .route({ method: "GET", path: "/" })
  .input(purchaseListSchema)
  .handler(async ({ input, context }) => {
    const { scope, status } = input;

    if (scope === "supplierOrder") {
      const orders = await context.db.query.purchaseOrder.findMany({
        where: { supplierId: input.supplierId, status },
        with: {
          purchase: {
            columns: { folio: true, createdAt: true },
          },
          items: { columns: { quantity: true, unitPrice: true } },
        },
      });

      return orders.map(({ items, ...order }) => ({
        scope,
        ...order,
        total: orderTotal(items),
      }));
    }

    const purchases = await context.db.query.purchase.findMany({
      where: { status },
      orderBy: { createdAt: "desc", id: "desc" },
      with: {
        orders: {
          columns: { status: true },
          with: { items: { columns: { quantity: true, unitPrice: true } } },
        },
      },
    });

    return purchases.map(({ orders, ...entry }) => ({
      scope,
      ...entry,
      ...summarizePurchase(orders),
    }));
  });
