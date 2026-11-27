import type { AppRouterOutputs } from "@suni/api/routers/index";
import { FlaskConical } from "lucide-react";
import { useRef, useState } from "react";
import type { ComponentProps } from "react";

import { ChangeStatusDialog } from "@/components/customers/shared/change-status-dialog";
import { EntityGrid } from "@/components/customers/shared/entity-grid";
import { useSetIngredientArchived } from "@/hooks/use-ingredients";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useListSuppliers } from "@/hooks/use-suppliers";

import { IngredientCard } from "./ingredient-card";
import { IngredientEditDialog } from "./ingredient-edit-dialog";

type Ingredient = AppRouterOutputs["ingredients"]["list"][number];

interface IngredientGridProps extends Pick<
  ComponentProps<typeof EntityGrid>,
  "copy" | "hasFilters" | "query"
> {
  ingredients: Ingredient[];
}

export function IngredientGrid({ ingredients, ...grid }: IngredientGridProps) {
  const [action, setAction] = useState<{
    kind: "edit" | "status";
    ingredient: Ingredient;
  }>();

  const [open, setOpen] = useState(false);
  const focus = useRef<HTMLDivElement>(null);
  const archive = useSetIngredientArchived();
  const isAdmin = useIsAdmin();
  const suppliers = useListSuppliers({ status: "active" });
  const activeSupplierIds = new Set(suppliers.data?.map(({ id }) => id));

  function show(kind: "edit" | "status", ingredient: Ingredient) {
    setAction({ kind, ingredient });
    setOpen(true);
  }

  return (
    <div ref={focus} tabIndex={-1}>
      <EntityGrid
        {...grid}
        icon={FlaskConical}
        isEmpty={ingredients.length === 0}
      >
        {ingredients.map((ingredient) => {
          const manageable =
            isAdmin && activeSupplierIds.has(ingredient.supplierId);

          return (
            <IngredientCard
              ingredient={ingredient}
              key={ingredient.id}
              onChangeStatus={
                manageable ? () => show("status", ingredient) : undefined
              }
              onEdit={
                manageable && !ingredient.archived
                  ? () => show("edit", ingredient)
                  : undefined
              }
            />
          );
        })}
      </EntityGrid>
      {action?.kind === "edit" ? (
        <IngredientEditDialog
          finalFocus={focus}
          ingredient={action.ingredient}
          onOpenChange={setOpen}
          open={open}
        />
      ) : null}
      {action?.kind === "status" ? (
        <ChangeStatusDialog
          entity={action.ingredient}
          finalFocus={focus}
          mutation={archive}
          noun="al ingrediente"
          onOpenChange={setOpen}
          open={open}
        />
      ) : null}
    </div>
  );
}
