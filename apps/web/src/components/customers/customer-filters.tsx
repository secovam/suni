import type { AppRouterOutputs } from "@suni/api/routers/index";
import { CUSTOMER_TYPES } from "@suni/db/schema/customer-enums";
import { getRouteApi } from "@tanstack/react-router";

import { FilterBar } from "@/components/customers/shared/filter-bar";
import { SegmentedControl } from "@/components/customers/shared/segmented-control";

const routeApi = getRouteApi("/_auth/customers/");

type TypeFilter = "all" | (typeof CUSTOMER_TYPES)[number];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  ...CUSTOMER_TYPES.map((value) => ({ value, label: value })),
];

interface CustomerFiltersProps {
  /** Customers in the current tab and search, before the type filter, for the counts. */
  customers: AppRouterOutputs["customers"]["list"][number][];
}

export default function CustomerFilters({ customers }: CustomerFiltersProps) {
  const { name, type } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const setFilters = (filters: { name?: string; type?: TypeFilter }) =>
    navigate({ search: (prev) => ({ ...prev, ...filters }), replace: true });

  const countOf = (value: TypeFilter) =>
    value === "all"
      ? customers.length
      : customers.filter((customer) => customer.type === value).length;

  return (
    <FilterBar
      onSearchChange={(value) => setFilters({ name: value })}
      search={name}
      searchLabel="Buscar por nombre"
    >
      <SegmentedControl
        legend="Tipo de cliente"
        onValueChange={(value) => setFilters({ type: value })}
        options={TYPE_OPTIONS.map((option) => ({
          ...option,
          count: countOf(option.value),
        }))}
        value={type}
      />
    </FilterBar>
  );
}
