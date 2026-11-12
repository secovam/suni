import { skipToken } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { NewEntityButton } from "@/components/customers/new-entity-button";
import { EntityGrid } from "@/components/customers/shared/entity-grid";
import {
  DEFAULT_BRANCH_FILTERS,
  byStatus,
  countByStatus,
  matchingName,
} from "@/components/customers/shared/filters";
import type {
  BranchFilters,
  StatusFilter,
} from "@/components/customers/shared/filters";
import {
  StatusSegmented,
  StatusTabs,
} from "@/components/customers/shared/status-tabs";
import { useListBranches } from "@/hooks/use-branches";
import { useListCustomers } from "@/hooks/use-customers";

import BranchCard from "./card";
import { BranchesFilters } from "./filters";

interface BranchesListProps {
  action?: ReactNode;
  filters: BranchFilters;
  onFiltersChange: (filters: BranchFilters) => void;
  /** Scopes the list to one customer and hides the customer filter. */
  customerId?: string;
}

export function BranchesList({
  filters,
  onFiltersChange,
  action,
  customerId,
}: BranchesListProps) {
  const pickedCustomerId =
    filters.customerId === "all" ? undefined : filters.customerId;

  const query = useListBranches({
    status: "all",
    customerId: customerId ?? pickedCustomerId,
  });

  // Archived customers stay listed so a filter on one keeps its label.
  const { data: customers } = useListCustomers(
    customerId ? skipToken : { status: "all" }
  );

  const rowsByStatus = useMemo(
    () => byStatus(matchingName(query.data ?? [], filters.name)),
    [query.data, filters.name]
  );

  const visibleBranches = rowsByStatus[filters.status];

  const hasFilters =
    filters.name.trim() !== "" ||
    (!customerId && filters.customerId !== DEFAULT_BRANCH_FILTERS.customerId);

  const statusProps = {
    counts: query.data ? countByStatus(rowsByStatus) : undefined,
    gender: "feminine" as const,
    onValueChange: (status: StatusFilter) =>
      onFiltersChange({ ...filters, status }),
    value: filters.status,
  };

  // Inside the customer or branch detail the page already has tabs, so the status is a segmented control.
  const isNested = customerId !== undefined;

  const list = (
    <>
      <BranchesFilters
        action={action}
        customers={customerId ? undefined : customers}
        filters={filters}
        onFiltersChange={onFiltersChange}
      >
        {isNested ? <StatusSegmented {...statusProps} /> : null}
      </BranchesFilters>

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

  if (isNested) {
    return list;
  }

  return <StatusTabs {...statusProps}>{list}</StatusTabs>;
}

interface BranchesGridProps {
  customerId: string;
  canCreate: boolean;
}

export function BranchesGrid({ customerId, canCreate }: BranchesGridProps) {
  // An archived customer archives all its branches, so "Activas" would always be empty.
  const [filters, setFilters] = useState<BranchFilters>({
    ...DEFAULT_BRANCH_FILTERS,
    status: canCreate ? "active" : "all",
  });

  return (
    <div className="flex min-w-full flex-col gap-4">
      <BranchesList
        action={
          canCreate ? (
            <NewEntityButton customerId={customerId} entity="branch" />
          ) : null
        }
        customerId={customerId}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}
