import type { AppRouterOutputs } from "@suni/api/routers/index";
import { CUSTOMER_TYPES } from "@suni/db/schema/customer-enums";
import { ReactSelect } from "@suni/ui/components/react-select";
import { getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";

import { FilterBar } from "@/components/customers/shared/filter-bar";

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

  const typeOptions = useMemo(
    () =>
      CUSTOMER_TYPES.map((value) => ({
        value,
        label: `${value} (${customers.filter((c) => c.type === value).length})`,
      })),
    [customers]
  );

  return (
    <FilterBar
      hasFilters={hasFilters}
      // Empty search falls back to the schema defaults.
      onClear={() => navigate({ search: {}, replace: true })}
      onSearchChange={(value) => setFilters({ name: value })}
      search={name}
      searchLabel="Buscar por nombre"
    >
      <ReactSelect
        aria-label="Filtrar por tipo"
        className="w-full lg:w-52"
        isClearable
        onChange={(option) => setFilters({ type: option?.value ?? "all" })}
        options={typeOptions}
        // "all" is the empty state, so it shows as the placeholder and offers nothing to clear.
        placeholder={`Todos los tipos (${customers.length})`}
        value={typeOptions.find((option) => option.value === type) ?? null}
      />
      <ReactSelect
        aria-label="Filtrar por estado"
        className="w-full lg:w-52"
        onChange={(option) => setFilters({ status: option?.value ?? "active" })}
        options={statusOptions}
        value={statusOptions.find((option) => option.value === status)}
      />
    </FilterBar>
  );
}
