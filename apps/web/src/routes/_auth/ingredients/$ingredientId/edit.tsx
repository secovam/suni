import { createFileRoute, redirect } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";

import { IngredientForm } from "@/components/ingredients/ingredient-form";
import { PageHeader } from "@/components/page-header";
import {
  ingredientQueryOptions,
  useGetIngredient,
} from "@/hooks/use-ingredients";
import { supplierQueryOptions } from "@/hooks/use-suppliers";

export const Route = createFileRoute("/_auth/ingredients/$ingredientId/edit")({
  beforeLoad: ({ context, params: { ingredientId } }) => {
    if (context.session.user.role !== "admin") {
      throw redirect({
        to: "/ingredients/$ingredientId",
        params: { ingredientId },
      });
    }
  },
  loader: async ({ context: { queryClient }, params: { ingredientId } }) => {
    const ingredient = await queryClient.query(
      ingredientQueryOptions(ingredientId)
    );

    const supplier = await queryClient.query(
      supplierQueryOptions(ingredient.supplierId)
    );

    if (ingredient.archived || supplier.archived) {
      throw redirect({
        to: "/ingredients/$ingredientId",
        params: { ingredientId },
      });
    }
  },
  component: RouteComponent,
  errorComponent: () => (
    <p className="text-destructive text-sm" role="alert">
      No se pudo cargar el ingrediente.
    </p>
  ),
});

function RouteComponent() {
  const { ingredientId } = Route.useParams();
  const { data: ingredient } = useGetIngredient(ingredientId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description={ingredient.name}
        icon={FlaskConical}
        title="Editar ingrediente"
      />
      <IngredientForm key={ingredient.id} ingredient={ingredient} />
    </div>
  );
}
