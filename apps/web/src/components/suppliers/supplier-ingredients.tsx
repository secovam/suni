import { IngredientGrid } from "@/components/ingredients/ingredient-grid";
import { useListIngredients } from "@/hooks/use-ingredients";

const LIST_COPY = {
  loading: "Cargando ingredientes",
  error: "No se pudieron cargar los ingredientes del proveedor",
  notFound: "No se encontraron ingredientes",
  empty: "Este proveedor aún no tiene ingredientes",
  emptyHint: "Los ingredientes asociados aparecerán aquí",
};

export function SupplierIngredients({ supplierId }: { supplierId: string }) {
  const query = useListIngredients({ status: "all" });

  const ingredients =
    query.data?.filter((ingredient) => ingredient.supplierId === supplierId) ??
    [];

  return (
    <IngredientGrid
      copy={LIST_COPY}
      hasFilters={false}
      ingredients={ingredients}
      query={query}
    />
  );
}
