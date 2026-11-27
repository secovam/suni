import type { PURCHASE_ORDER_STATUSES } from "@suni/db/schema/purchase-order-enums";

interface PricedItem {
  quantity: string;
  unitPrice: string | null;
}

interface PurchaseOrderSummary {
  status: (typeof PURCHASE_ORDER_STATUSES)[number];
  items: PricedItem[];
}

function scaledInteger(value: string, scale: number) {
  const [whole, fraction = ""] = value.split(".");

  return BigInt(whole + fraction.padEnd(scale, "0"));
}

function formatCents(value: bigint) {
  return `${value / 100n}.${String(value % 100n).padStart(2, "0")}`;
}

function orderCents(items: PricedItem[]) {
  let total = 0n;

  for (const { quantity, unitPrice } of items) {
    if (unitPrice === null) {
      return null;
    }

    total +=
      (scaledInteger(quantity, 3) * scaledInteger(unitPrice, 2) + 500n) / 1000n;
  }

  return total;
}

export function orderTotal(items: PricedItem[]) {
  const total = orderCents(items);

  return total === null ? null : formatCents(total);
}

export function summarizePurchase(orders: PurchaseOrderSummary[]) {
  const active = orders.filter(({ status }) => status !== "cancelled");
  let cents = 0n;
  let hasMissingPrice = false;

  for (const { items } of active) {
    const total = orderCents(items);

    if (total === null) {
      hasMissingPrice = true;
    } else {
      cents += total;
    }
  }

  return {
    supplierCount: orders.length,
    activeSupplierCount: active.length,
    partiallyCancelled: active.length > 0 && active.length < orders.length,
    activeTotal: hasMissingPrice ? null : formatCents(cents),
  };
}
