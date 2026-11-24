import { createId } from "@paralleldrive/cuid2";
import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { INGREDIENT_UNITS } from "./ingredient-enums";
import { supplier } from "./suppliers";

export const ingredientUnit = pgEnum("ingredient_unit", INGREDIENT_UNITS);

export const ingredient = pgTable(
  "ingredient",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => supplier.id),
    unit: ingredientUnit("unit").notNull(),
    imageUrl: text("image_url").notNull().default(""),
    modifiedBy: text("modified_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    archived: timestamp("archived"),
  },
  (table) => [index("ingredient_supplier_id_idx").on(table.supplierId)]
);
