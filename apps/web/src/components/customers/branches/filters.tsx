import { Button } from "@suni/ui/components/button";
import { Input } from "@suni/ui/components/input";
import { ReactSelect } from "@suni/ui/components/react-select";
import { X } from "lucide-react";

import { FilterBadge } from "@/components/customers/shared/filter-badge";
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
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "archived", label: "Archivadas" },
];

const MAX_CUSTOMER_BADGE_LENGTH = 20;

interface BranchesFiltersProps {
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
}: BranchesFiltersProps) {
  const showCustomerFilter = !!customers;

  const customerOptions: Option[] = [
    { value: "all", label: "Todos los clientes" },
    ...(customers ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  const selectedCustomerName =
    filters.customerId === "all"
      ? null
      : (customers?.find((c) => c.id === filters.customerId)?.name ?? null);

  const update = (patch: Partial<BranchFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          className="h-9 flex-1"
          onChange={(event) => update({ name: event.target.value })}
          placeholder="Buscar por nombre de sucursal..."
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

      {showCustomerFilter && (
        <div className="flex flex-wrap gap-3">
          <ReactSelect
            className="min-w-45 flex-1"
            isClearable
            onChange={(option: Option | null) =>
              update({ customerId: option?.value ?? "all" })
            }
            options={customerOptions}
            placeholder="Cliente"
            value={customerOptions.find(
              (opt) => opt.value === filters.customerId
            )}
          />
        </div>
      )}

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 border-t pt-2">
          <span className="text-muted-foreground mr-1 text-xs">
            Filtros activos:
          </span>

          {filters.name.trim() && (
            <FilterBadge onClear={() => update({ name: "" })}>
              Nombre: &ldquo;{filters.name.trim()}&rdquo;
            </FilterBadge>
          )}

          {filters.status !== "all" && (
            <FilterBadge onClear={() => update({ status: "all" })}>
              Estatus:{" "}
              {
                STATUS_OPTIONS.find((opt) => opt.value === filters.status)
                  ?.label
              }
            </FilterBadge>
          )}

          {showCustomerFilter && selectedCustomerName && (
            <FilterBadge onClear={() => update({ customerId: "all" })}>
              Cliente:{" "}
              {selectedCustomerName.length > MAX_CUSTOMER_BADGE_LENGTH
                ? `${selectedCustomerName.slice(0, MAX_CUSTOMER_BADGE_LENGTH)}...`
                : selectedCustomerName}
            </FilterBadge>
          )}

          <Button
            className="ml-auto"
            size="sm"
            onClick={() => onFiltersChange(DEFAULT_BRANCH_FILTERS)}
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
