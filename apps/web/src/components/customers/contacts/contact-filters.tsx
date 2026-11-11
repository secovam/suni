import { Button } from "@suni/ui/components/button";
import { Input } from "@suni/ui/components/input";
import { ReactSelect } from "@suni/ui/components/react-select";
import { X } from "lucide-react";

import { FilterBadge } from "@/components/customers/shared/filter-badge";
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
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "archived", label: "Archivados" },
];

interface ContactsFiltersProps {
  filters: ContactFilters;
  hasFilters: boolean;
  onFiltersChange: (filters: ContactFilters) => void;
}

export function ContactsFilters({
  filters,
  hasFilters,
  onFiltersChange,
}: ContactsFiltersProps) {
  const hasName = filters.name.trim() !== "";
  const hasStatus = filters.status !== "all";

  const statusLabel = STATUS_OPTIONS.find(
    (option) => option.value === filters.status
  )?.label;

  const update = (patch: Partial<ContactFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          className="h-9 flex-1"
          onChange={(event) => update({ name: event.target.value })}
          placeholder="Buscar por nombre..."
          type="text"
          value={filters.name}
        />
        <ReactSelect
          className="w-full min-w-30 sm:w-37.5"
          onChange={(option: Option<StatusFilter> | null) =>
            update({ status: option?.value ?? "all" })
          }
          options={STATUS_OPTIONS}
          placeholder="Estatus"
          value={STATUS_OPTIONS.find((opt) => opt.value === filters.status)}
        />
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 border-t pt-2">
          <span className="text-muted-foreground mr-1 text-xs">
            Filtros activos:
          </span>

          {hasName && (
            <FilterBadge onClear={() => update({ name: "" })}>
              Nombre: &ldquo;{filters.name.trim()}&rdquo;
            </FilterBadge>
          )}

          {hasStatus && (
            <FilterBadge onClear={() => update({ status: "all" })}>
              Estatus: {statusLabel}
            </FilterBadge>
          )}

          <Button
            className="ml-auto"
            onClick={() => onFiltersChange(DEFAULT_CONTACT_FILTERS)}
            size="sm"
            variant="ghost"
          >
            Limpiar todo
            <X className="ml-1 size-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
