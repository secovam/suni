import { Button } from "@suni/ui/components/button";
import { Input } from "@suni/ui/components/input";
import { ReactSelect } from "@suni/ui/components/react-select";
import {
  Link,
  createFileRoute,
  stripSearchParams,
} from "@tanstack/react-router";
import { ContactRound, Loader2, Plus, SearchX, Users, X } from "lucide-react";
import { useMemo } from "react";
import type { ComponentProps } from "react";
import { z } from "zod";

import CustomerCard from "@/components/customers/customer-card";
import { useListCustomers } from "@/hooks/use-customers";

const defaultFilters = { name: "", type: "all", archived: false };

const searchSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  archived: z.boolean().optional(),
});

export const Route = createFileRoute("/_auth/customers/")({
  validateSearch: searchSchema,
  search: { middlewares: [stripSearchParams(defaultFilters)] },
  component: RouteComponent,
});

type CustomerItem = ComponentProps<typeof CustomerCard>["customer"];

function CustomerList({
  customers,
  hasFilters,
  isPending,
}: {
  customers: CustomerItem[];
  hasFilters: boolean;
  isPending: boolean;
}) {
  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
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

function RouteComponent() {
  const {
    name = defaultFilters.name,
    type = defaultFilters.type,
    archived = defaultFilters.archived,
  } = Route.useSearch();

  const navigate = Route.useNavigate();

  const setName = (value: string) =>
    navigate({ search: (prev) => ({ ...prev, name: value }), replace: true });

  const setType = (value: string) =>
    navigate({ search: (prev) => ({ ...prev, type: value }), replace: true });

  const setArchived = (value: boolean) =>
    navigate({
      search: (prev) => ({ ...prev, archived: value }),
      replace: true,
    });

  const clearFilters = () => navigate({ search: defaultFilters });

  const { data: customers = [], isPending } = useListCustomers({
    includeArchived: archived,
  });

  const matchingName = useMemo(() => {
    const term = name.trim().toLowerCase();

    return customers
      .filter((customer) => customer.name.toLowerCase().includes(term))
      .toSorted((a, b) => a.name.localeCompare(b.name, "es"));
  }, [customers, name]);

  const typeOptions = useMemo(() => {
    const count = (value: string) =>
      matchingName.filter((customer) => customer.type === value).length;

    return [
      { value: "all", label: `Todos los tipos (${matchingName.length})` },
      { value: "Cliente", label: `Cliente (${count("Cliente")})` },
      { value: "Asesor", label: `Asesor (${count("Asesor")})` },
    ];
  }, [matchingName]);

  const visibleCustomers =
    type === "all"
      ? matchingName
      : matchingName.filter((customer) => customer.type === type);

  const hasFilters = name.trim() !== "" || type !== "all" || archived;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border-border from-muted/60 to-muted/25 flex items-center justify-between rounded-xl border bg-linear-to-r px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <ContactRound className="text-success h-4.5 w-4.5" />
            </div>
            <h1 className="text-success text-xl font-bold">Clientes</h1>
          </div>
          <p className="text-brand mt-2 text-sm">
            Gestiona los clientes del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link to="/customers/new" />}
            variant="green"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            onChange={(event) => setName(event.target.value)}
            placeholder="Buscar por nombre..."
            type="search"
            value={name}
          />
        </div>
        <ReactSelect
          className="w-full sm:w-55"
          isClearable
          onChange={(option) => setType(option?.value || "all")}
          options={typeOptions}
          placeholder="Filtrar por tipo..."
          value={typeOptions.find((option) => option.value === type)}
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm whitespace-nowrap select-none">
          <input
            checked={archived}
            className="size-4 cursor-pointer"
            onChange={(event) => setArchived(event.target.checked)}
            type="checkbox"
          />
          Mostrar archivados
        </label>
        {hasFilters && (
          <Button onClick={clearFilters} variant="ghost">
            Limpiar
            <X className="ml-1 size-3" />
          </Button>
        )}
      </div>

      <CustomerList
        customers={visibleCustomers}
        hasFilters={hasFilters}
        isPending={isPending}
      />
    </div>
  );
}
