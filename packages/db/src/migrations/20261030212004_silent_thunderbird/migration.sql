CREATE TYPE "acquisition" AS ENUM('Redes sociales', 'Recomendación', 'Prospección', 'Teléfono', 'Correo', 'Página web', 'Díptico');--> statement-breakpoint
CREATE TYPE "customer_type" AS ENUM('Cliente', 'Asesor');--> statement-breakpoint
CREATE TABLE "customer" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"rfc" text NOT NULL,
	"street" text NOT NULL,
	"int_number" text,
	"ext_number" text NOT NULL,
	"city" text NOT NULL,
	"suburb" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text NOT NULL,
	"phone" text NOT NULL,
	"phone_extension" text,
	"acquisition" "acquisition" NOT NULL,
	"type" "customer_type" DEFAULT 'Cliente'::"customer_type" NOT NULL,
	"seller_id" text NOT NULL,
	"modified_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived" timestamp
);
--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_seller_id_user_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_modified_by_user_id_fkey" FOREIGN KEY ("modified_by") REFERENCES "user"("id");