import { ReactSelect } from "@suni/ui/components/react-select";
import type { ReactNode } from "react";

import { FilterBar } from "@/components/customers/shared/filter-bar";
import { DEFAULT_BRANCH_FILTERS } from "@/components/customers/shared/filters";
import type {
  BranchFilters,
  StatusFilter,
} from "@/components/customers/shared/filters";

interface Option<T extends string = string> {
  value: T;
  label: string;
}

const STATUS_OPTIONS: Option<StatusFilter>[] = [
  { value: "all", label: "Todas las sucursales" },
  { value: "active", label: "Sucursales activas" },
  { value: "archived", label: "Sucursales archivadas" },
];

interface BranchesFiltersProps {
  action?: ReactNode;
  filters: BranchFilters;
  hasFilters: boolean;
  onFiltersChange: (filters: BranchFilters) => void;
  customers?: { id: string; name: string }[];
}

export function BranchesFilters({
  filters,
  hasFilters,
  onFiltersChange,
  customers,
  action,
}: BranchesFiltersProps) {
  const customerOptions: Option[] = (customers ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const update = (patch: Partial<BranchFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  return (
    <FilterBar
      action={action}
      hasFilters={hasFilters}
      onClear={() => onFiltersChange(DEFAULT_BRANCH_FILTERS)}
      onSearchChange={(name) => update({ name })}
      search={filters.name}
      searchLabel="Buscar sucursal"
    >
      {customers ? (
        <ReactSelect
          aria-label="Filtrar por cliente"
          className="w-full lg:w-64"
          isClearable
          onChange={(option: Option | null) =>
            update({ customerId: option?.value ?? "all" })
          }
          options={customerOptions}
          // "all" is the empty state, so it shows as the placeholder and offers nothing to clear.
          placeholder="Todos los clientes"
          value={
            filters.customerId === "all"
              ? null
              : (customerOptions.find(
                  (opt) => opt.value === filters.customerId
                ) ?? {
                  value: filters.customerId,
                  label: "Cliente seleccionado",
                })
          }
        />
      ) : null}
      <ReactSelect
        aria-label="Filtrar por estado"
        className="w-full lg:w-52"
        onChange={(option: Option<StatusFilter> | null) =>
          update({ status: option?.value ?? "all" })
        }
        options={STATUS_OPTIONS}
        value={STATUS_OPTIONS.find((opt) => opt.value === filters.status)}
      />
    </FilterBar>
  );
}
