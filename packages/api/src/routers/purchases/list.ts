import { purchaseListSchema } from "@suni/db/validation/purchase-orders";

import { adminProcedure } from "../../index";
import { orderTotal, summarizePurchase } from "./totals";

function startOfPurchaseDay(date: string) {
  return new Date(`${date}T00:00:00-06:00`);
}

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
        itemCount: items.length,
        total: orderTotal(items),
      }));
    }

    const {
      supplierId,
      ingredientId,
      folio,
      dateFrom,
      dateTo,
      sortOrder = "desc",
    } = input;

    const end = dateTo ? startOfPurchaseDay(dateTo) : undefined;

    if (end) {
      end.setUTCDate(end.getUTCDate() + 1);
    }

    const purchases = await context.db.query.purchase.findMany({
      where: {
        status,
        folio: folio
          ? { ilike: `%${folio.replaceAll(/[\\%_]/gu, "\\$&")}%` }
          : undefined,
        createdAt:
          dateFrom || end
            ? {
                gte: dateFrom ? startOfPurchaseDay(dateFrom) : undefined,
                lt: end,
              }
            : undefined,
        orders:
          supplierId || ingredientId
            ? {
                supplierId,
                items: ingredientId ? { ingredientId } : undefined,
              }
            : undefined,
      },
      orderBy: { createdAt: sortOrder, id: sortOrder },
      with: {
        orders: {
          columns: { status: true, supplierName: true },
          orderBy: { supplierName: "asc" },
          with: { items: { columns: { quantity: true, unitPrice: true } } },
        },
      },
    });

    return purchases.map(({ orders, ...entry }) => ({
      scope,
      ...entry,
      supplierNames: orders.map(({ supplierName }) => supplierName),
      itemCount: orders.reduce((count, { items }) => count + items.length, 0),
      ...summarizePurchase(orders),
    }));
  });
