import { branchSchema } from "@suni/db/validation/branches";
import { Button } from "@suni/ui/components/button";
import { revalidateLogic, useSelector } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

import { useAppForm } from "@/components/form/use-app-form";
import { useCreateBranch, useUpdateBranch } from "@/hooks/use-branches";
import { POSTAL_CODE_LENGTH, useAddressLookup } from "@/hooks/use-postal-code";

import type { Branch } from "./util/branch-address";

type FormValues = z.input<typeof branchSchema>;

interface BranchFormProps {
  customerId: string;
  branch?: Branch;
  onSuccess?: () => void;
  onCancel: () => void;
}

const PHONE_LENGTH = 10;

const FILLED_BY_POSTAL_CODE = "Se llena con el código postal";

const EMPTY_VALUES: FormValues = {
  name: "",
  street: "",
  extNumber: "",
  intNumber: "",
  postalCode: "",
  suburb: "",
  city: "",
  state: "",
  phone: "",
  frontImageUrl: "",
};

function toFormValues(branch?: Branch): FormValues {
  if (!branch) {
    return EMPTY_VALUES;
  }

  return {
    name: branch.name,
    street: branch.street,
    extNumber: branch.extNumber,
    intNumber: branch.intNumber,
    postalCode: branch.postalCode,
    suburb: branch.suburb,
    city: branch.city,
    state: branch.state,
    phone: branch.phone,
    frontImageUrl: branch.frontImageUrl,
  };
}

export function BranchForm({
  customerId,
  branch,
  onSuccess,
  onCancel,
}: BranchFormProps) {
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();

  const submitting = createBranch.isPending || updateBranch.isPending;

  const form = useAppForm({
    defaultValues: toFormValues(branch),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: branchSchema },
    onSubmit: ({ value }) => {
      if (branch) {
        updateBranch.mutate(
          { id: branch.id, ...value },
          { onSuccess: () => onSuccess?.() }
        );
      } else {
        createBranch.mutate(
          { customerId, ...value },
          { onSuccess: () => onSuccess?.() }
        );
      }
    },
  });

  const zip = useSelector(form.store, (state) => state.values.postalCode);
  const address = useAddressLookup(zip);

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <fieldset className="space-y-4">
        <legend className="text-foreground mb-4 text-lg font-semibold">
          Datos generales
        </legend>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form.AppField name="name">
            {(field) => (
              <field.TextField label="Nombre de la sucursal" required />
            )}
          </form.AppField>
          <form.AppField name="phone">
            {(field) => (
              <field.DigitsField
                autoComplete="tel-national"
                label="Teléfono"
                maxLength={PHONE_LENGTH}
              />
            )}
          </form.AppField>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-foreground mb-4 text-lg font-semibold">
          Dirección
        </legend>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form.AppField
            listeners={{
              onChange: ({ value }) =>
                address.fill(value, {
                  getPostalCode: () => form.getFieldValue("postalCode"),
                  set: (field, fieldValue) =>
                    form.setFieldValue(field, fieldValue),
                }),
            }}
            name="postalCode"
          >
            {(field) => (
              <field.DigitsField
                autoComplete="postal-code"
                hint={address.hint}
                label="Código postal"
                maxLength={POSTAL_CODE_LENGTH}
                required
              />
            )}
          </form.AppField>
          <form.AppField name="suburb">
            {(field) => (
              <field.SelectField
                creatable
                label="Colonia"
                options={address.suburbOptions}
                placeholder={
                  address.suburbLocked
                    ? FILLED_BY_POSTAL_CODE
                    : "Selecciona o escribe la colonia..."
                }
                readOnly={address.suburbLocked}
                required
              />
            )}
          </form.AppField>
          <form.AppField name="city">
            {(field) => (
              <field.TextField
                autoComplete="address-level2"
                label="Municipio"
                placeholder={address.regionLocked ? FILLED_BY_POSTAL_CODE : ""}
                readOnly={address.regionLocked}
                required
              />
            )}
          </form.AppField>
          <form.AppField name="state">
            {(field) => (
              <field.TextField
                autoComplete="address-level1"
                label="Estado"
                placeholder={address.regionLocked ? FILLED_BY_POSTAL_CODE : ""}
                readOnly={address.regionLocked}
                required
              />
            )}
          </form.AppField>
          <form.AppField name="street">
            {(field) => (
              <field.TextField
                autoComplete="address-line1"
                label="Calle"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="extNumber">
            {(field) => <field.TextField label="Número exterior" required />}
          </form.AppField>
          <form.AppField name="intNumber">
            {(field) => <field.TextField label="Número interior" />}
          </form.AppField>
        </div>
      </fieldset>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          className="w-full sm:w-auto"
          disabled={submitting}
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          Cancelar
        </Button>
        <Button
          className="w-full sm:w-auto"
          disabled={submitting}
          type="submit"
        >
          {submitting ? <Loader2 className="animate-spin" /> : null}
          {branch ? "Guardar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
