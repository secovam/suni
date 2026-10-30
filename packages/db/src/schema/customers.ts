import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { ACQUISITION_CHANNELS, CUSTOMER_TYPES } from "./customer-enums";

export const acquisitionEnum = pgEnum("acquisition", ACQUISITION_CHANNELS);

export const customerTypeEnum = pgEnum("customer_type", CUSTOMER_TYPES);

export const customer = pgTable("customer", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  rfc: text("rfc").notNull(),
  street: text("street").notNull(),
  intNumber: text("int_number"),
  extNumber: text("ext_number").notNull(),
  city: text("city").notNull(),
  suburb: text("suburb").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  phone: text("phone").notNull(),
  phoneExtension: text("phone_extension"),
  acquisition: acquisitionEnum("acquisition").notNull(),
  type: customerTypeEnum("type").notNull().default("Cliente"),
  sellerId: text("seller_id")
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
  archived: timestamp("archived"),
});
