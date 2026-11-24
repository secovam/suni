import { FlaskConical } from "lucide-react";

import { EntityGrid } from "@/components/customers/shared/entity-grid";
import { IngredientCard } from "@/components/ingredients/ingredient-card";
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
    <EntityGrid
      copy={LIST_COPY}
      hasFilters={false}
      icon={FlaskConical}
      isEmpty={ingredients.length === 0}
      query={query}
    >
      {ingredients.map((ingredient) => (
        <IngredientCard ingredient={ingredient} key={ingredient.id} />
      ))}
    </EntityGrid>
  );
}
