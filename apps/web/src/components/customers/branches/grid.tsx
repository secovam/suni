import { skipToken } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { useMemo, useState } from "react";

import { NewEntityButton } from "@/components/customers/new-entity-button";
import { EntityGrid } from "@/components/customers/shared/entity-grid";
import {
  DEFAULT_BRANCH_FILTERS,
  matchingName,
} from "@/components/customers/shared/filters";
import type { BranchFilters } from "@/components/customers/shared/filters";
import { useListBranches } from "@/hooks/use-branches";
import { useListCustomers } from "@/hooks/use-customers";

import BranchCard from "./card";
import { BranchesFilters } from "./filters";

interface BranchesListProps {
  filters: BranchFilters;
  onFiltersChange: (filters: BranchFilters) => void;
  /** Scopes the list to one customer and hides the customer filter. */
  customerId?: string;
}

export function BranchesList({
  filters,
  onFiltersChange,
  customerId,
}: BranchesListProps) {
  const pickedCustomerId =
    filters.customerId === "all" ? undefined : filters.customerId;

  const query = useListBranches({
    status: filters.status,
    customerId: customerId ?? pickedCustomerId,
  });

  // Archived customers stay listed so a filter on one keeps its label.
  const { data: customers } = useListCustomers(
    customerId ? skipToken : { status: "all" }
  );

  const visibleBranches = useMemo(
    () => matchingName(query.data ?? [], filters.name),
    [query.data, filters.name]
  );

  const hasFilters =
    filters.name.trim() !== "" ||
    filters.status !== DEFAULT_BRANCH_FILTERS.status ||
    (!customerId && filters.customerId !== DEFAULT_BRANCH_FILTERS.customerId);

  return (
    <>
      <BranchesFilters
        customers={customerId ? undefined : customers}
        filters={filters}
        hasFilters={hasFilters}
        onFiltersChange={onFiltersChange}
      />

      <EntityGrid
        copy={{
          loading: "Cargando sucursales…",
          error: "No se pudieron cargar las sucursales.",
          notFound: "No se encontraron sucursales",
          empty: "No hay sucursales para mostrar",
          emptyHint: "Las sucursales aparecerán aquí",
        }}
        hasFilters={hasFilters}
        icon={Building2}
        isEmpty={visibleBranches.length === 0}
        query={query}
      >
        {visibleBranches.map((branch) => (
          <BranchCard
            branch={branch}
            customer={customerId ? undefined : branch.customer}
            key={branch.id}
          />
        ))}
      </EntityGrid>
    </>
  );
}

interface BranchesGridProps {
  customerId: string;
  canCreate: boolean;
}

export function BranchesGrid({ customerId, canCreate }: BranchesGridProps) {
  const [filters, setFilters] = useState(DEFAULT_BRANCH_FILTERS);

  return (
    <div className="flex min-w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-lg font-semibold">Sucursales</h2>
        {canCreate ? (
          <NewEntityButton customerId={customerId} entity="branch" />
        ) : null}
      </div>

      <BranchesList
        customerId={customerId}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}
