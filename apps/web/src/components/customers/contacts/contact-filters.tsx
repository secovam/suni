import type { ReactNode } from "react";

import { FilterBar } from "@/components/customers/shared/filter-bar";
import type { ContactFilters } from "@/components/customers/shared/filters";

interface ContactsFiltersProps {
  action?: ReactNode;
  /** The status control, when the page has no status tabs. */
  children?: ReactNode;
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
}

export function ContactsFilters({
  filters,
  onFiltersChange,
  action,
  children,
}: ContactsFiltersProps) {
  return (
    <FilterBar
      action={action}
      onSearchChange={(name) => onFiltersChange({ ...filters, name })}
      search={filters.name}
      searchLabel="Buscar contacto"
    >
      {children}
    </FilterBar>
  );
}
