CREATE TYPE "ingredient_unit" AS ENUM('kg', 'gm', 'lt', 'ml');--> statement-breakpoint
CREATE TYPE "purchase_order_status" AS ENUM('draft', 'generated', 'sent', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TABLE "ingredient" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"supplier_id" text NOT NULL,
	"unit" "ingredient_unit" NOT NULL,
	"price" numeric(12,2),
	"image_url" text DEFAULT '' NOT NULL,
	"modified_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived" timestamp,
	CONSTRAINT "ingredient_price_nonnegative" CHECK ("price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "purchase" (
	"id" text PRIMARY KEY,
	"folio" text NOT NULL UNIQUE,
	"status" "purchase_order_status" DEFAULT 'generated'::"purchase_order_status" NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_by" text NOT NULL,
	"modified_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"cancelled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "purchase_order" (
	"id" text PRIMARY KEY,
	"folio" text NOT NULL UNIQUE,
	"purchase_id" text NOT NULL,
	"supplier_id" text NOT NULL,
	"supplier_name" text NOT NULL,
	"supplier_rfc" text NOT NULL,
	"status" "purchase_order_status" DEFAULT 'generated'::"purchase_order_status" NOT NULL,
	"cancelled_at" timestamp,
	CONSTRAINT "purchase_order_purchase_supplier_unique" UNIQUE("purchase_id","supplier_id")
);
--> statement-breakpoint
CREATE TABLE "purchase_order_item" (
	"id" text PRIMARY KEY,
	"purchase_order_id" text NOT NULL,
	"ingredient_id" text NOT NULL,
	"ingredient_name" text NOT NULL,
	"unit" "ingredient_unit" NOT NULL,
	"quantity" numeric(14,3) NOT NULL,
	"unit_price" numeric(12,2),
	CONSTRAINT "purchase_order_item_quantity_positive" CHECK ("quantity" > 0),
	CONSTRAINT "purchase_order_item_price_nonnegative" CHECK ("unit_price" >= 0)
);
--> statement-breakpoint
CREATE INDEX "ingredient_supplier_id_idx" ON "ingredient" ("supplier_id");--> statement-breakpoint
CREATE INDEX "purchase_order_supplier_id_idx" ON "purchase_order" ("supplier_id");--> statement-breakpoint
CREATE INDEX "purchase_order_item_order_id_idx" ON "purchase_order_item" ("purchase_order_id");--> statement-breakpoint
CREATE INDEX "purchase_order_item_ingredient_id_idx" ON "purchase_order_item" ("ingredient_id");--> statement-breakpoint
ALTER TABLE "ingredient" ADD CONSTRAINT "ingredient_supplier_id_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id");--> statement-breakpoint
ALTER TABLE "ingredient" ADD CONSTRAINT "ingredient_modified_by_user_id_fkey" FOREIGN KEY ("modified_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_modified_by_user_id_fkey" FOREIGN KEY ("modified_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_purchase_id_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchase"("id");--> statement-breakpoint
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_supplier_id_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id");--> statement-breakpoint
ALTER TABLE "purchase_order_item" ADD CONSTRAINT "purchase_order_item_purchase_order_id_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_order"("id");--> statement-breakpoint
ALTER TABLE "purchase_order_item" ADD CONSTRAINT "purchase_order_item_ingredient_id_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredient"("id");