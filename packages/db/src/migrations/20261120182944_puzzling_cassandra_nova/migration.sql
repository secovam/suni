CREATE TABLE "supplier" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"rfc" text NOT NULL,
	"street" text NOT NULL,
	"int_number" text DEFAULT '' NOT NULL,
	"ext_number" text NOT NULL,
	"city" text NOT NULL,
	"suburb" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text NOT NULL,
	"phone" text NOT NULL,
	"phone_extension" text DEFAULT '' NOT NULL,
	"modified_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived" timestamp
);
--> statement-breakpoint
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_modified_by_user_id_fkey" FOREIGN KEY ("modified_by") REFERENCES "user"("id");