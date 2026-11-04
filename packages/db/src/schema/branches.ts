import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { customer } from "./customers";

export const branch = pgTable("customer_branches", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  street: text("street").notNull(),
  intNumber: text("int_number"),
  extNumber: text("ext_number").notNull(),
  city: text("city").notNull(),
  suburb: text("suburb").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  phone: text("phone"),
  frontImageUrl: text("front_image_url"),
  customerId: text("customer_id")
    .notNull()
    .references(() => customer.id),
  sellerId: text("seller_id")
    .notNull()
    .references(() => user.id),
  modifiedBy: text("modified_by")
    .notNull()
    .references(() => user.id),
  archived: timestamp("archived"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
