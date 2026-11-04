import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { branch } from "./branches";
import { CONTACT_TYPES } from "./contact-enums";
import { customer } from "./customers";

export const contactTypeEnum = pgEnum("contact_type", CONTACT_TYPES);

export const contact = pgTable("contact", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  phoneExtension: text("phone_extension"),
  position: text("position"),
  type: contactTypeEnum("type").notNull(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customer.id),
  branchId: text("branch_id").references(() => branch.id),
  archived: timestamp("archived"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
