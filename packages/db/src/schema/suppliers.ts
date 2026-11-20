import { createId } from "@paralleldrive/cuid2";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const supplier = pgTable("supplier", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  rfc: text("rfc").notNull(),
  street: text("street").notNull(),
  intNumber: text("int_number").notNull().default(""),
  extNumber: text("ext_number").notNull(),
  city: text("city").notNull(),
  suburb: text("suburb").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  phone: text("phone").notNull(),
  phoneExtension: text("phone_extension").notNull().default(""),
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
