import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { branch } from "./branches";
import { customer } from "./customers";

export const contact = pgTable("contact", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  phoneExtension: text("phone_extension").notNull().default(""),
  position: text("position").notNull().default(""),
  customerId: text("customer_id")
    .notNull()
    .references(() => customer.id),
  branchId: text("branch_id").references(() => branch.id),
  archived: timestamp("archived"),
  modifiedBy: text("modified_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
