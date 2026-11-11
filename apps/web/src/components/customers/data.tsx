import type { AppRouterOutputs } from "@suni/api/routers/index";
import { cn } from "@suni/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface CustomerDataProps {
  customer: AppRouterOutputs["customers"]["get"];
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <dt className="text-muted-foreground text-xs font-medium">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export function CustomerData({ customer }: CustomerDataProps) {
  return (
    <section
      aria-label="Datos del cliente"
      className="bg-card rounded-xl border p-5"
    >
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-5">
        <Field className="sm:col-span-2" label="Dirección fiscal">
          <address className="not-italic">
            {customer.street}, No. Ext. {customer.extNumber}
            {customer.intNumber && `, No. Int. ${customer.intNumber}`}, Colonia{" "}
            {customer.suburb}
            <br />
            {`${customer.city}, ${customer.state}, CP ${customer.postalCode}`}
          </address>
        </Field>

        <Field label="Teléfono">
          <span className="tabular-nums">
            {customer.phone}
            {customer.phoneExtension && ` ext. ${customer.phoneExtension}`}
          </span>
        </Field>

        <Field label="Medio de adquisición">{customer.acquisition}</Field>

        {customer.seller ? (
          <Field label="Vendedor">
            <Link
              className="text-primary underline underline-offset-4 hover:decoration-2"
              params={{ userId: customer.seller.id }}
              to="/users/$userId/edit"
            >
              {customer.seller.name}
            </Link>
          </Field>
        ) : null}
      </dl>
    </section>
  );
}
