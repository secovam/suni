import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import {
  check,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { ingredient, ingredientUnit } from "./ingredients";
import { PURCHASE_ORDER_STATUSES } from "./purchase-order-enums";
import { supplier } from "./suppliers";

export const purchaseOrderStatus = pgEnum(
  "purchase_order_status",
  PURCHASE_ORDER_STATUSES
);

export const purchase = pgTable("purchase", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  folio: text("folio").notNull().unique(),
  status: purchaseOrderStatus("status").notNull().default("draft"),
  notes: text("notes").notNull().default(""),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  modifiedBy: text("modified_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  confirmedAt: timestamp("confirmed_at"),
  cancelledAt: timestamp("cancelled_at"),
});

export const purchaseOrder = pgTable(
  "purchase_order",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    folio: text("folio").notNull().unique(),
    purchaseId: text("purchase_id")
      .notNull()
      .references(() => purchase.id),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => supplier.id),
    supplierName: text("supplier_name").notNull(),
    supplierRfc: text("supplier_rfc").notNull(),
  },
  (table) => [
    unique("purchase_order_purchase_supplier_unique").on(
      table.purchaseId,
      table.supplierId
    ),
    index("purchase_order_supplier_id_idx").on(table.supplierId),
  ]
);

export const purchaseOrderItem = pgTable(
  "purchase_order_item",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    purchaseOrderId: text("purchase_order_id")
      .notNull()
      .references(() => purchaseOrder.id),
    ingredientId: text("ingredient_id")
      .notNull()
      .references(() => ingredient.id),
    ingredientName: text("ingredient_name").notNull(),
    unit: ingredientUnit("unit").notNull(),
    quantity: numeric("quantity", { precision: 14, scale: 3 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }),
  },
  (table) => [
    index("purchase_order_item_order_id_idx").on(table.purchaseOrderId),
    index("purchase_order_item_ingredient_id_idx").on(table.ingredientId),
    check("purchase_order_item_quantity_positive", sql`${table.quantity} > 0`),
    check(
      "purchase_order_item_price_nonnegative",
      sql`${table.unitPrice} >= 0`
    ),
  ]
);
