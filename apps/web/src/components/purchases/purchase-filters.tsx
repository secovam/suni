import type { AppRouterInputs } from "@suni/api/routers/index";
import { Button } from "@suni/ui/components/button";
import { Input } from "@suni/ui/components/input";
import { Label } from "@suni/ui/components/label";
import { ReactSelect } from "@suni/ui/components/react-select";
import { getRouteApi } from "@tanstack/react-router";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  CalendarDays,
  X,
} from "lucide-react";

import { FilterBar } from "@/components/customers/shared/filter-bar";
import { useListIngredients } from "@/hooks/use-ingredients";
import { useListSuppliers } from "@/hooks/use-suppliers";

type Filters = Omit<
  Extract<AppRouterInputs["purchases"]["list"], { scope: "purchase" }>,
  "scope" | "status"
>;

const routeApi = getRouteApi("/_auth/purchases/");

export function PurchaseFilters() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const suppliers = useListSuppliers({ status: "all" });
  const ingredients = useListIngredients({ status: "all" });
  const ascending = search.sortOrder === "asc";
  const SortIcon = ascending ? ArrowUpNarrowWide : ArrowDownWideNarrow;
  const hasFilters = Object.values(search).some(Boolean);

  const supplierOptions =
    suppliers.data?.map(({ id, name }) => ({ value: id, label: name })) ?? [];

  const ingredientOptions =
    ingredients.data?.map(({ id, name, supplier }) => ({
      value: id,
      label: `${name} · ${supplier.name}`,
    })) ?? [];

  function change(filters: Filters) {
    navigate({
      search: (current) => ({ ...current, ...filters }),
      replace: true,
    });
  }

  return (
    <section
      aria-label="Filtros de órdenes de compra"
      className="bg-card rounded-xl border"
    >
      <div className="grid items-center gap-3 p-4 md:grid-cols-3">
        <FilterBar
          onSearchChange={(folio) =>
            change({ folio: folio.slice(0, 100) || undefined })
          }
          search={search.folio ?? ""}
          searchLabel="Buscar por folio"
        />
        <ReactSelect
          aria-label="Filtrar por proveedor"
          isClearable
          isLoading={suppliers.isPending}
          noOptionsMessage={() => "No se encontraron proveedores"}
          onChange={(option) => change({ supplierId: option?.value })}
          options={supplierOptions}
          placeholder="Todos los proveedores"
          value={
            supplierOptions.find(({ value }) => value === search.supplierId) ??
            null
          }
        />
        <ReactSelect
          aria-label="Filtrar por ingrediente"
          isClearable
          isLoading={ingredients.isPending}
          noOptionsMessage={() => "No se encontraron ingredientes"}
          onChange={(option) => change({ ingredientId: option?.value })}
          options={ingredientOptions}
          placeholder="Todos los ingredientes"
          value={
            ingredientOptions.find(
              ({ value }) => value === search.ingredientId
            ) ?? null
          }
        />
      </div>
      <div className="bg-muted/25 flex flex-wrap items-center justify-between gap-3 rounded-b-xl border-t px-4 py-3">
        <fieldset className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <legend className="sr-only">Rango de fechas</legend>
          <CalendarDays
            aria-hidden
            className="text-muted-foreground hidden size-4 sm:block"
          />
          <div className="flex items-center gap-2">
            <Label htmlFor="purchase-filter-from">Desde</Label>
            <div className="w-36">
              <Input
                id="purchase-filter-from"
                max={search.dateTo}
                onChange={(event) =>
                  change({ dateFrom: event.target.value || undefined })
                }
                type="date"
                value={search.dateFrom ?? ""}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="purchase-filter-to">Hasta</Label>
            <div className="w-36">
              <Input
                id="purchase-filter-to"
                min={search.dateFrom}
                onChange={(event) =>
                  change({ dateTo: event.target.value || undefined })
                }
                type="date"
                value={search.dateTo ?? ""}
              />
            </div>
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => change({ sortOrder: ascending ? undefined : "asc" })}
            size="sm"
            type="button"
            variant="outline"
          >
            <SortIcon aria-hidden />
            {ascending ? "Más antiguas primero" : "Más recientes primero"}
          </Button>
          {hasFilters ? (
            <Button
              onClick={() => navigate({ search: {}, replace: true })}
              size="sm"
              type="button"
              variant="ghost"
            >
              <X aria-hidden /> Limpiar filtros
            </Button>
          ) : null}
        </div>
      </div>
      {suppliers.isError || ingredients.isError ? (
        <p className="text-destructive border-t px-4 py-2 text-sm" role="alert">
          No se pudieron cargar todas las opciones de filtro.
        </p>
      ) : null}
    </section>
  );
}
