import type { AppRouterOutputs } from "@suni/api/routers/index";
import { branchSchema } from "@suni/db/validation/branches";
import { Button } from "@suni/ui/components/button";
import { revalidateLogic, useSelector } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

import { useAppForm } from "@/components/form/use-app-form";
import { useCreateBranch, useUpdateBranch } from "@/hooks/use-branches";
import { postalCodeQueryOptions, usePostalCode } from "@/hooks/use-postal-code";
import type { Settlement } from "@/hooks/use-postal-code";

type Branch = AppRouterOutputs["branches"]["list"][number];

type FormValues = z.input<typeof branchSchema>;

interface BranchFormProps {
  customerId: string;
  branch?: Branch;
  onSuccess?: () => void;
  onCancel: () => void;
}

const POSTAL_CODE_LENGTH = 5;

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

function postalCodeStatus(
  query: UseQueryResult<Settlement[]>,
  settlements: Settlement[]
): string | null {
  if (query.isFetching) {
    return "Buscando código postal…";
  }

  if (query.isError) {
    return "No se pudo consultar el código postal. Captura la dirección a mano.";
  }

  if (query.isSuccess && settlements.length === 0) {
    return "No encontramos ese código postal. Captura la dirección a mano.";
  }

  return null;
}

export function BranchForm({
  customerId,
  branch,
  onSuccess,
  onCancel,
}: BranchFormProps) {
  const queryClient = useQueryClient();
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
  const postalCode = usePostalCode(zip);
  const settlements = postalCode.data ?? [];

  // SEPOMEX define municipio y estado; solo un fallo o un código inexistente los desbloquea.
  const regionLocked = !(
    postalCode.isError ||
    (postalCode.isSuccess && settlements.length === 0)
  );

  // La colonia solo espera a la consulta; después queda abierta por si SEPOMEX no la tiene.
  const suburbLocked = !(postalCode.isSuccess || postalCode.isError);

  const suburbOptions = [...new Set(settlements.map((s) => s.d_asenta))].map(
    (value) => ({ value, label: value })
  );

  const fillAddress = async (value: string) => {
    form.setFieldValue("suburb", "");
    form.setFieldValue("city", "");
    form.setFieldValue("state", "");

    if (value.length !== POSTAL_CODE_LENGTH) {
      return;
    }

    let found: Settlement[];

    try {
      found = await queryClient.query(postalCodeQueryOptions(value));
    } catch {
      // usePostalCode muestra el error bajo el campo.
      return;
    }

    // El usuario siguió escribiendo mientras corría la petición.
    if (form.getFieldValue("postalCode") !== value) {
      return;
    }

    const [first] = found;

    if (!first) {
      return;
    }

    form.setFieldValue("city", first.d_mnpio);
    form.setFieldValue("state", first.d_estado);

    if (found.length === 1) {
      form.setFieldValue("suburb", first.d_asenta);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <fieldset className="space-y-4">
        <legend className="text-brand mb-4 text-lg font-semibold">
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
        <legend className="text-brand mb-4 text-lg font-semibold">
          Dirección
        </legend>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form.AppField
            listeners={{ onChange: ({ value }) => fillAddress(value) }}
            name="postalCode"
          >
            {(field) => (
              <field.DigitsField
                autoComplete="postal-code"
                hint={postalCodeStatus(postalCode, settlements)}
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
                options={suburbOptions}
                placeholder={
                  suburbLocked
                    ? FILLED_BY_POSTAL_CODE
                    : "Selecciona o escribe la colonia..."
                }
                readOnly={suburbLocked}
                required
              />
            )}
          </form.AppField>
          <form.AppField name="city">
            {(field) => (
              <field.TextField
                autoComplete="address-level2"
                label="Municipio"
                placeholder={regionLocked ? FILLED_BY_POSTAL_CODE : ""}
                readOnly={regionLocked}
                required
              />
            )}
          </form.AppField>
          <form.AppField name="state">
            {(field) => (
              <field.TextField
                autoComplete="address-level1"
                label="Estado"
                placeholder={regionLocked ? FILLED_BY_POSTAL_CODE : ""}
                readOnly={regionLocked}
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
          variant="outline-destructive"
        >
          Cancelar
        </Button>
        <Button
          className="w-full sm:w-auto"
          disabled={submitting}
          type="submit"
          variant="green"
        >
          {submitting ? <Loader2 className="animate-spin" /> : null}
          {branch ? "Guardar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
