import { ingredientListSchema } from "@suni/db/validation/ingredients";
import { Button } from "@suni/ui/components/button";
import {
  Link,
  createFileRoute,
  stripSearchParams,
} from "@tanstack/react-router";
import { Plus, FlaskConical } from "lucide-react";
import { z } from "zod";

import { matchingName } from "@/components/customers/shared/filters";
import { StatusTabs } from "@/components/customers/shared/status-tabs";
import { IngredientFilters } from "@/components/ingredients/ingredient-filters";
import { IngredientGrid } from "@/components/ingredients/ingredient-grid";
import { PageHeader } from "@/components/page-header";
import { useListIngredients } from "@/hooks/use-ingredients";
import { useIsAdmin } from "@/hooks/use-is-admin";

/* oxlint-disable promise/prefer-await-to-then, github/no-then -- zod `.catch()` is not Promise.catch */
const searchSchema = ingredientListSchema.extend({
  name: z.string().default("").catch(""),
  status: ingredientListSchema.shape.status.catch("active"),
});
/* oxlint-enable promise/prefer-await-to-then, github/no-then */

const defaultFilters = searchSchema.parse({});

const LIST_COPY = {
  loading: "Cargando ingredientes",
  error: "No se pudieron cargar los ingredientes",
  notFound: "No se encontraron ingredientes",
  empty: "No hay ingredientes para mostrar",
  emptyHint: "Los ingredientes aparecerán aquí",
};

export const Route = createFileRoute("/_auth/ingredients/")({
  validateSearch: searchSchema,
  search: { middlewares: [stripSearchParams(defaultFilters)] },
  component: RouteComponent,
});

function RouteComponent() {
  const { name, status } = Route.useSearch();
  const navigate = Route.useNavigate();
  const isAdmin = useIsAdmin();
  const query = useListIngredients({ status });
  const ingredients = matchingName(query.data ?? [], name);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        actions={
          isAdmin ? (
            <Button
              nativeButton={false}
              render={<Link to="/ingredients/new" />}
            >
              <Plus aria-hidden />
              Nuevo ingrediente
            </Button>
          ) : undefined
        }
        description="Consulta el catálogo de ingredientes"
        icon={FlaskConical}
        title="Catálogo de ingredientes"
      />
      <StatusTabs
        onValueChange={(next) =>
          navigate({
            search: (prev) => ({ ...prev, status: next }),
            replace: true,
          })
        }
        value={status}
      >
        <IngredientFilters />
        <IngredientGrid
          copy={LIST_COPY}
          hasFilters={name.trim() !== ""}
          ingredients={ingredients}
          query={query}
        />
      </StatusTabs>
    </div>
  );
}
