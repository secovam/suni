ALTER TABLE "customer_branches" ALTER COLUMN "int_number" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "customer_branches" ALTER COLUMN "int_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_branches" ALTER COLUMN "phone" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "customer_branches" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_branches" ALTER COLUMN "front_image_url" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "customer_branches" ALTER COLUMN "front_image_url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "contact" ALTER COLUMN "phone_extension" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "contact" ALTER COLUMN "phone_extension" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "contact" ALTER COLUMN "position" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "contact" ALTER COLUMN "position" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customer" ALTER COLUMN "int_number" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "customer" ALTER COLUMN "int_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customer" ALTER COLUMN "phone_extension" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "customer" ALTER COLUMN "phone_extension" SET NOT NULL;