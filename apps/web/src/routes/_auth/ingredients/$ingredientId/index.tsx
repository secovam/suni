import { Badge } from "@suni/ui/components/badge";
import { Button } from "@suni/ui/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, ArchiveRestore, Pencil, FlaskConical } from "lucide-react";
import { useRef, useState } from "react";

import { ChangeStatusDialog } from "@/components/customers/shared/change-status-dialog";
import { IngredientData } from "@/components/ingredients/ingredient-data";
import { PageHeader } from "@/components/page-header";
import {
  ingredientQueryOptions,
  useGetIngredient,
  useSetIngredientArchived,
} from "@/hooks/use-ingredients";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { supplierQueryOptions, useGetSupplier } from "@/hooks/use-suppliers";

export const Route = createFileRoute("/_auth/ingredients/$ingredientId/")({
  loader: async ({ context: { queryClient }, params: { ingredientId } }) => {
    const ingredient = await queryClient.query(
      ingredientQueryOptions(ingredientId)
    );

    await queryClient.query(supplierQueryOptions(ingredient.supplierId));
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
  const { data: supplier } = useGetSupplier(ingredient.supplierId);
  const canManage = useIsAdmin() && !supplier.archived;
  const [dialogOpen, setDialogOpen] = useState(false);
  const statusButton = useRef<HTMLButtonElement>(null);
  const archive = useSetIngredientArchived();
  const isArchived = !!ingredient.archived;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        actions={
          canManage ? (
            <>
              {isArchived ? null : (
                <Button
                  nativeButton={false}
                  render={
                    <Link
                      params={{ ingredientId }}
                      to="/ingredients/$ingredientId/edit"
                    />
                  }
                >
                  <Pencil aria-hidden />
                  Editar
                </Button>
              )}
              <Button
                onClick={() => setDialogOpen(true)}
                ref={statusButton}
                variant="outline"
              >
                {isArchived ? (
                  <ArchiveRestore aria-hidden />
                ) : (
                  <Archive aria-hidden />
                )}
                {isArchived ? "Desarchivar" : "Archivar"}
              </Button>
            </>
          ) : undefined
        }
        description={
          <div className="flex items-center gap-2">
            <span>{ingredient.unit}</span>
            {supplier.archived ? (
              <Badge variant="secondary">Proveedor archivado</Badge>
            ) : null}
            {isArchived ? <Badge variant="secondary">Archivado</Badge> : null}
          </div>
        }
        icon={FlaskConical}
        title={ingredient.name}
      />
      <IngredientData ingredient={ingredient} />
      {canManage ? (
        <ChangeStatusDialog
          entity={ingredient}
          finalFocus={statusButton}
          mutation={archive}
          noun="al ingrediente"
          onOpenChange={setDialogOpen}
          open={dialogOpen}
        />
      ) : null}
    </div>
  );
}
