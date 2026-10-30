import type { AppRouterOutputs } from "@suni/api/routers/index";
import { CUSTOMER_TYPES } from "@suni/db/schema/customer-enums";
import { Button } from "@suni/ui/components/button";
import { Input } from "@suni/ui/components/input";
import { ReactSelect } from "@suni/ui/components/react-select";
import { getRouteApi } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useMemo } from "react";

const routeApi = getRouteApi("/_auth/customers/");

type Search = ReturnType<typeof routeApi.useSearch>;

const statusOptions: { value: Search["status"]; label: string }[] = [
  { value: "active", label: "Clientes activos" },
  { value: "archived", label: "Clientes archivados" },
  { value: "all", label: "Todos los clientes" },
];

interface CustomerFiltersProps {
  customers: AppRouterOutputs["customers"]["list"][number][];
  hasFilters: boolean;
}

export default function CustomerFilters({
  customers,
  hasFilters,
}: CustomerFiltersProps) {
  const { name, type, status } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const setFilters = (filters: Partial<Search>) =>
    navigate({ search: (prev) => ({ ...prev, ...filters }), replace: true });

  const typeOptions = useMemo(() => {
    const count = (value: string) =>
      customers.filter((customer) => customer.type === value).length;

    return [
      {
        value: "all" as const,
        label: `Todos los tipos (${customers.length})`,
      },
      ...CUSTOMER_TYPES.map((value) => ({
        value,
        label: `${value} (${count(value)})`,
      })),
    ];
  }, [customers]);

  return (
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
        onChange={(option) => setFilters({ status: option?.value ?? "active" })}
        options={statusOptions}
        value={statusOptions.find((option) => option.value === status)}
      />
      {hasFilters && (
        // Empty search falls back to the schema defaults.
        <Button
          onClick={() => navigate({ search: {}, replace: true })}
          variant="ghost"
        >
          Limpiar
          <X className="ml-1 size-3" />
        </Button>
      )}
    </div>
  );
}
