CREATE TABLE "customer_branches" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"street" text NOT NULL,
	"int_number" text,
	"ext_number" text NOT NULL,
	"city" text NOT NULL,
	"suburb" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text NOT NULL,
	"phone" text,
	"front_image_url" text,
	"customer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"modified_by" text NOT NULL,
	"archived" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"phone_extension" text,
	"position" text,
	"customer_id" text NOT NULL,
	"branch_id" text,
	"archived" timestamp,
	"modified_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_branches" ADD CONSTRAINT "customer_branches_customer_id_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id");--> statement-breakpoint
ALTER TABLE "customer_branches" ADD CONSTRAINT "customer_branches_seller_id_user_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "customer_branches" ADD CONSTRAINT "customer_branches_modified_by_user_id_fkey" FOREIGN KEY ("modified_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_customer_id_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id");--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_branch_id_customer_branches_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "customer_branches"("id");--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_modified_by_user_id_fkey" FOREIGN KEY ("modified_by") REFERENCES "user"("id");