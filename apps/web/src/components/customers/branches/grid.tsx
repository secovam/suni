import { Button } from "@suni/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { Building2, Plus, SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import { orpc } from "@/utils/orpc";

import { BranchFormDialog } from "./branch-form-dialog";
import BranchCard from "./card";
import { BranchesFilters } from "./filters";
import type { BranchFilters } from "./filters";

interface BranchesGridProps {
  customerId: string;
}

const DEFAULT_BRANCH_FILTERS: BranchFilters = {
  name: "",
  status: "all",
  customerId: "all",
};

export function BranchesGrid({ customerId }: BranchesGridProps) {
  const [filters, setFilters] = useState<BranchFilters>(DEFAULT_BRANCH_FILTERS);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    data: branches = [],
    isPending,
    isError,
  } = useQuery(orpc.branches.list.queryOptions({ input: { customerId } }));

  const filtered = useMemo(() => {
    const term = filters.name.trim().toLowerCase();

    return branches.filter((branch) => {
      if (term && !branch.name.toLowerCase().includes(term)) {
        return false;
      }

      if (filters.status === "active") {
        return !branch.archived;
      }

      if (filters.status === "archived") {
        return !!branch.archived;
      }

      return true;
    });
  }, [branches, filters]);

  const hasActiveFilters =
    filters.name.trim() !== "" || filters.status !== "all";

  return (
    <>
      <div className="flex min-w-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-brand text-lg font-semibold">Sucursales</h2>
          <Button onClick={() => setIsFormOpen(true)} variant="green">
            <Plus className="mr-2 size-4" />
            Nueva sucursal
          </Button>
        </div>

        <BranchesFilters filters={filters} onFiltersChange={setFilters} />

        {isPending ? (
          <p className="text-muted-foreground p-8 text-center text-sm">
            Cargando sucursales…
          </p>
        ) : null}

        {isError ? (
          <p className="text-destructive p-8 text-center text-sm">
            No se pudieron cargar las sucursales.
          </p>
        ) : null}

        {!(isPending || isError) && filtered.length === 0 ? (
          <div className="flex min-h-70 flex-col items-center justify-center p-8 text-center">
            {hasActiveFilters ? (
              <SearchX
                className="text-muted-foreground/70 mb-4 size-12"
                strokeWidth={1}
              />
            ) : (
              <Building2
                className="text-muted-foreground/70 mb-4 size-12"
                strokeWidth={1}
              />
            )}
            <p className="text-muted-foreground text-sm font-medium">
              {hasActiveFilters
                ? "No se encontraron sucursales"
                : "No hay sucursales para mostrar"}
            </p>
            <p className="text-muted-foreground/70 mt-1 text-xs">
              {hasActiveFilters
                ? "Intenta con otros filtros de búsqueda"
                : "Las sucursales del cliente aparecerán aquí"}
            </p>
          </div>
        ) : null}

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((branch) => (
              <BranchCard branch={branch} key={branch.id} />
            ))}
          </div>
        ) : null}
      </div>

      <BranchFormDialog
        customerId={customerId}
        onOpenChange={setIsFormOpen}
        open={isFormOpen}
      />
    </>
  );
}
