import { ReactSelect } from "@suni/ui/components/react-select";
import type { ReactNode } from "react";

import { FilterBar } from "@/components/customers/shared/filter-bar";
import type { BranchFilters } from "@/components/customers/shared/filters";

interface Option {
  value: string;
  label: string;
}

interface BranchesFiltersProps {
  action?: ReactNode;
  /** The status control, when the page has no status tabs. */
  children?: ReactNode;
  filters: BranchFilters;
  onFiltersChange: (filters: BranchFilters) => void;
  customers?: { id: string; name: string }[];
}

export function BranchesFilters({
  filters,
  onFiltersChange,
  customers,
  action,
  children,
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
      onSearchChange={(name) => update({ name })}
      search={filters.name}
      searchLabel="Buscar sucursal"
    >
      {customers ? (
        <ReactSelect
          aria-label="Filtrar por cliente"
          className="w-full sm:w-64"
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
      {children}
    </FilterBar>
  );
}
