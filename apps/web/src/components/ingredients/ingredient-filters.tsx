import { getRouteApi } from "@tanstack/react-router";

import { FilterBar } from "@/components/customers/shared/filter-bar";

const routeApi = getRouteApi("/_auth/ingredients/");

export function IngredientFilters() {
  const { name } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  return (
    <FilterBar
      onSearchChange={(next) =>
        navigate({
          search: (prev) => ({ ...prev, name: next }),
          replace: true,
        })
      }
      search={name}
      searchLabel="Buscar por nombre de la sustancia"
    />
  );
}
