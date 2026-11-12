import { Button } from "@suni/ui/components/button";
import { Input } from "@suni/ui/components/input";
import { ReactSelect } from "@suni/ui/components/react-select";
import { X } from "lucide-react";

export type ContactStatusFilter = "all" | "active" | "archived";

export interface ContactFilters {
  name: string;
  status: ContactStatusFilter;
}

const DEFAULT_CONTACT_FILTERS: ContactFilters = {
  name: "",
  status: "all",
};

interface Option<T extends string = string> {
  value: T;
  label: string;
}

const STATUS_OPTIONS: Option<ContactStatusFilter>[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "archived", label: "Archivados" },
];

interface ContactsFiltersProps {
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
}

function FilterBadge({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <button
      className="hover:bg-muted inline-flex cursor-pointer items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors"
      onClick={onClear}
      type="button"
    >
      {children}
      <X className="ml-1 size-3" />
    </button>
  );
}

export function ContactsFilters({
  filters,
  onFiltersChange,
}: ContactsFiltersProps) {
  const hasName = filters.name.trim() !== "";
  const hasStatus = filters.status !== "all";
  const hasActiveFilters = hasName || hasStatus;

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
          onChange={(option: Option<ContactStatusFilter> | null) =>
            update({ status: option?.value ?? "all" })
          }
          options={STATUS_OPTIONS}
          placeholder="Estatus"
          value={STATUS_OPTIONS.find((opt) => opt.value === filters.status)}
        />
      </div>

      {hasActiveFilters && (
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
