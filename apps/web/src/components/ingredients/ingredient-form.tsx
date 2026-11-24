import type {
  AppRouterInputs,
  AppRouterOutputs,
} from "@suni/api/routers/index";
import { INGREDIENT_UNITS } from "@suni/db/schema/ingredient-enums";
import { ingredientSchema } from "@suni/db/validation/ingredients";
import { Button } from "@suni/ui/components/button";
import { revalidateLogic } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { useAppForm } from "@/components/form/use-app-form";
import {
  useCreateIngredient,
  useUpdateIngredient,
} from "@/hooks/use-ingredients";
import { useListSuppliers } from "@/hooks/use-suppliers";

const UNIT_OPTIONS = INGREDIENT_UNITS.map((unit) => ({
  label: unit,
  value: unit,
}));

const EMPTY_VALUES: AppRouterInputs["ingredients"]["create"] = {
  name: "",
  supplierId: "",
  unit: "kg",
  imageUrl: "",
};

interface IngredientFormProps {
  ingredient?: AppRouterOutputs["ingredients"]["get"];
}

export function IngredientForm({ ingredient }: IngredientFormProps) {
  const navigate = useNavigate();
  const create = useCreateIngredient();
  const update = useUpdateIngredient();
  const suppliers = useListSuppliers({ status: "active" });

  const supplierOptions = (suppliers.data ?? []).map(({ id, name }) => ({
    label: name,
    value: id,
  }));

  const submitting = create.isPending || update.isPending;

  const form = useAppForm({
    defaultValues: ingredient
      ? {
          name: ingredient.name,
          supplierId: ingredient.supplierId,
          unit: ingredient.unit,
          imageUrl: ingredient.imageUrl,
        }
      : EMPTY_VALUES,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: ingredientSchema },
    onSubmit: ({ value }) => {
      const fields = ingredientSchema.parse(value);

      if (ingredient) {
        update.mutate(
          { ...fields, id: ingredient.id },
          {
            onSuccess: () =>
              navigate({
                to: "/ingredients/$ingredientId",
                params: { ingredientId: ingredient.id },
              }),
          }
        );

        return;
      }

      create.mutate(fields, {
        onSuccess: () => navigate({ to: "/ingredients" }),
      });
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <fieldset className="grid gap-4 lg:grid-cols-2">
        <legend className="text-foreground mb-4 text-lg font-semibold">
          Datos generales
        </legend>
        <form.AppField name="name">
          {(field) => (
            <field.TextField label="Nombre de la sustancia" required />
          )}
        </form.AppField>
        <form.AppField name="supplierId">
          {(field) => (
            <field.SelectField
              label="Proveedor"
              options={supplierOptions}
              readOnly={supplierOptions.length === 0}
              required
            />
          )}
        </form.AppField>
        <form.AppField name="unit">
          {(field) => (
            <field.SelectField
              label="Unidad de medida"
              options={UNIT_OPTIONS}
              required
            />
          )}
        </form.AppField>
        <form.AppField name="imageUrl">
          {(field) => (
            <field.TextField inputMode="url" label="URL de la imagen" />
          )}
        </form.AppField>
      </fieldset>
      {suppliers.isPending ? <output>Cargando proveedores…</output> : null}
      {suppliers.isError ? (
        <div className="flex items-center gap-3">
          <p className="text-destructive text-sm" role="alert">
            No se pudieron cargar los proveedores.
          </p>
          <Button
            onClick={() => suppliers.refetch()}
            type="button"
            variant="outline"
          >
            Reintentar
          </Button>
        </div>
      ) : null}
      {suppliers.isSuccess && supplierOptions.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No hay proveedores activos.
        </p>
      ) : null}
      <div className="flex justify-end gap-3">
        <Button
          nativeButton={false}
          render={
            ingredient ? (
              <Link
                params={{ ingredientId: ingredient.id }}
                to="/ingredients/$ingredientId"
              />
            ) : (
              <Link to="/ingredients" />
            )
          }
          variant="outline"
        >
          Cancelar
        </Button>
        <Button
          disabled={submitting || supplierOptions.length === 0}
          type="submit"
        >
          {submitting ? <Loader2 aria-hidden className="animate-spin" /> : null}
          {ingredient ? "Guardar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
