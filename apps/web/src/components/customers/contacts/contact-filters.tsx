import { ReactSelect } from "@suni/ui/components/react-select";
import type { ReactNode } from "react";

import { FilterBar } from "@/components/customers/shared/filter-bar";
import { DEFAULT_CONTACT_FILTERS } from "@/components/customers/shared/filters";
import type {
  ContactFilters,
  StatusFilter,
} from "@/components/customers/shared/filters";

interface Option<T extends string = string> {
  value: T;
  label: string;
}

const STATUS_OPTIONS: Option<StatusFilter>[] = [
  { value: "all", label: "Todos los contactos" },
  { value: "active", label: "Contactos activos" },
  { value: "archived", label: "Contactos archivados" },
];

interface ContactsFiltersProps {
  action?: ReactNode;
  filters: ContactFilters;
  hasFilters: boolean;
  onFiltersChange: (filters: ContactFilters) => void;
}

export function ContactsFilters({
  filters,
  hasFilters,
  onFiltersChange,
  action,
}: ContactsFiltersProps) {
  const update = (patch: Partial<ContactFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  return (
    <FilterBar
      action={action}
      hasFilters={hasFilters}
      onClear={() => onFiltersChange(DEFAULT_CONTACT_FILTERS)}
      onSearchChange={(name) => update({ name })}
      search={filters.name}
      searchLabel="Buscar contacto"
    >
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
