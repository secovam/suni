import { CircleAlert, Loader2, SearchX, Users } from "lucide-react";
import type { ComponentProps } from "react";

import CustomerCard from "./customer-card";

type CustomerItem = ComponentProps<typeof CustomerCard>["customer"];

export default function CustomerList({
  customers,
  hasFilters,
  isError,
  isPending,
}: {
  customers: CustomerItem[];
  hasFilters: boolean;
  isError: boolean;
  isPending: boolean;
}) {
  if (isPending) {
    return (
      <output
        aria-label="Cargando clientes"
        className="flex items-center justify-center py-12"
      >
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </output>
    );
  }

  if (isError) {
    return (
      <div
        className="flex min-h-70 flex-col items-center justify-center gap-1 p-8 text-center"
        role="alert"
      >
        <CircleAlert
          className="text-destructive/70 mb-3 size-12"
          strokeWidth={1}
        />
        <p className="text-muted-foreground text-sm font-medium">
          No se pudieron cargar los clientes
        </p>
        <p className="text-muted-foreground text-xs">
          Recarga la página para intentar de nuevo
        </p>
      </div>
    );
  }

  if (customers.length === 0) {
    const EmptyIcon = hasFilters ? SearchX : Users;

    return (
      <div className="flex min-h-70 flex-col items-center justify-center gap-1 p-8 text-center">
        <EmptyIcon
          className="text-muted-foreground/70 mb-3 size-12"
          strokeWidth={1}
        />
        <p className="text-muted-foreground text-sm font-medium">
          {hasFilters
            ? "No se encontraron clientes"
            : "No hay clientes para mostrar"}
        </p>
        <p className="text-muted-foreground text-xs">
          {hasFilters
            ? "Intenta con otros filtros de búsqueda"
            : "Los clientes aparecerán aquí"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => (
        <CustomerCard customer={customer} key={customer.id} />
      ))}
    </div>
  );
}
