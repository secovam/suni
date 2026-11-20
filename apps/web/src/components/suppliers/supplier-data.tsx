import type { AppRouterOutputs } from "@suni/api/routers/index";

interface SupplierDataProps {
  supplier: AppRouterOutputs["suppliers"]["get"];
}

export function SupplierData({ supplier }: SupplierDataProps) {
  return (
    <section
      aria-label="Datos del proveedor"
      className="bg-card rounded-xl border p-5"
    >
      <dl className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-muted-foreground text-xs font-medium">
            Dirección fiscal
          </dt>
          <dd className="text-sm">
            <address className="not-italic">
              {supplier.street}, No. Ext. {supplier.extNumber}
              {supplier.intNumber && `, No. Int. ${supplier.intNumber}`},
              Colonia {supplier.suburb}
              <br />
              {supplier.city}, {supplier.state}, CP {supplier.postalCode}
            </address>
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-muted-foreground text-xs font-medium">
            Teléfono
          </dt>
          <dd className="text-sm tabular-nums">
            {supplier.phone}
            {supplier.phoneExtension && ` ext. ${supplier.phoneExtension}`}
          </dd>
        </div>
      </dl>
    </section>
  );
}
