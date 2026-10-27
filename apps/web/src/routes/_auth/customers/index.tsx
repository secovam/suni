import {
  CUSTOMER_STATUSES,
  CUSTOMER_TYPES,
} from "@suni/db/schema/customer-enums";
import { Button } from "@suni/ui/components/button";
import { Input } from "@suni/ui/components/input";
import { ReactSelect } from "@suni/ui/components/react-select";
import {
  Link,
  createFileRoute,
  stripSearchParams,
} from "@tanstack/react-router";
import {
  CircleAlert,
  ContactRound,
  Loader2,
  Plus,
  SearchX,
  Users,
  X,
} from "lucide-react";
import { useMemo } from "react";
import type { ComponentProps } from "react";
import { z } from "zod";

import CustomerCard from "@/components/customers/customer-card";
import { useListCustomers } from "@/hooks/use-customers";

/* oxlint-disable promise/prefer-await-to-then, github/no-then */
const searchSchema = z.object({
  name: z.string().default("").catch(""),
  type: z
    .enum(["all", ...CUSTOMER_TYPES])
    .default("all")
    .catch("all"),
  status: z.enum(CUSTOMER_STATUSES).default("active").catch("active"),
});
/* oxlint-enable promise/prefer-await-to-then, github/no-then */

type Search = z.infer<typeof searchSchema>;

const defaultFilters = searchSchema.parse({});

const statusOptions: { value: Search["status"]; label: string }[] = [
  { value: "active", label: "Clientes activos" },
  { value: "archived", label: "Clientes archivados" },
  { value: "all", label: "Todos los clientes" },
];

const stripAccents = (value: string) =>
  value.normalize("NFD").replaceAll(/\p{Diacritic}/gu, "");

export const Route = createFileRoute("/_auth/customers/")({
  validateSearch: searchSchema,
  search: { middlewares: [stripSearchParams(defaultFilters)] },
  component: RouteComponent,
});

type CustomerItem = ComponentProps<typeof CustomerCard>["customer"];

function CustomerList({
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

function RouteComponent() {
  const { name, type, status } = Route.useSearch();

  const navigate = Route.useNavigate();

  const setFilters = (filters: Partial<Search>) =>
    navigate({ search: (prev) => ({ ...prev, ...filters }), replace: true });

  const {
    data: customers = [],
    isError,
    isPending,
  } = useListCustomers({ status });

  const matchingName = useMemo(() => {
    const term = stripAccents(name.trim()).toLowerCase();

    return customers
      .filter((customer) =>
        stripAccents(customer.name).toLowerCase().includes(term)
      )
      .toSorted((a, b) => a.name.localeCompare(b.name, "es"));
  }, [customers, name]);

  const typeOptions = useMemo(() => {
    const count = (value: string) =>
      matchingName.filter((customer) => customer.type === value).length;

    return [
      {
        value: "all" as const,
        label: `Todos los tipos (${matchingName.length})`,
      },
      ...CUSTOMER_TYPES.map((value) => ({
        value,
        label: `${value} (${count(value)})`,
      })),
    ];
  }, [matchingName]);

  const visibleCustomers =
    type === "all"
      ? matchingName
      : matchingName.filter((customer) => customer.type === type);

  const hasFilters =
    name.trim() !== "" || type !== "all" || status !== defaultFilters.status;

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
            aria-label="Buscar por nombre"
            onChange={(event) => setFilters({ name: event.target.value })}
            placeholder="Buscar por nombre..."
            type="search"
            value={name}
          />
        </div>
        <ReactSelect
          aria-label="Filtrar por tipo"
          className="w-full sm:w-55"
          isClearable
          onChange={(option) => setFilters({ type: option?.value ?? "all" })}
          options={typeOptions}
          placeholder="Filtrar por tipo..."
          value={typeOptions.find((option) => option.value === type)}
        />
        <ReactSelect
          aria-label="Filtrar por estado"
          className="w-full sm:w-55"
          onChange={(option) =>
            setFilters({ status: option?.value ?? "active" })
          }
          options={statusOptions}
          value={statusOptions.find((option) => option.value === status)}
        />
        {hasFilters && (
          <Button onClick={() => setFilters(defaultFilters)} variant="ghost">
            Limpiar
            <X className="ml-1 size-3" />
          </Button>
        )}
      </div>

      <CustomerList
        customers={visibleCustomers}
        hasFilters={hasFilters}
        isError={isError}
        isPending={isPending}
      />
    </div>
  );
}
