import type {
  AppRouterInputs,
  AppRouterOutputs,
} from "@suni/api/routers/index";
import { supplierSchema } from "@suni/db/validation/suppliers";
import { Button } from "@suni/ui/components/button";
import { revalidateLogic, useSelector } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { useAppForm } from "@/components/form/use-app-form";
import { POSTAL_CODE_LENGTH, useAddressLookup } from "@/hooks/use-postal-code";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/use-suppliers";

const RFC_MAX_LENGTH = 13;

const PHONE_LENGTH = 10;

const FILLED_BY_POSTAL_CODE = "Se llena con el código postal";

const EMPTY_VALUES: AppRouterInputs["suppliers"]["create"] = {
  name: "",
  rfc: "",
  phone: "",
  phoneExtension: "",
  postalCode: "",
  suburb: "",
  city: "",
  state: "",
  street: "",
  extNumber: "",
  intNumber: "",
};

interface SupplierFormProps {
  supplier?: AppRouterOutputs["suppliers"]["get"];
}

export function SupplierForm({ supplier }: SupplierFormProps) {
  const navigate = useNavigate();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const submitting = createSupplier.isPending || updateSupplier.isPending;

  const form = useAppForm({
    defaultValues: supplier
      ? {
          name: supplier.name,
          rfc: supplier.rfc,
          phone: supplier.phone,
          phoneExtension: supplier.phoneExtension,
          postalCode: supplier.postalCode,
          suburb: supplier.suburb,
          city: supplier.city,
          state: supplier.state,
          street: supplier.street,
          extNumber: supplier.extNumber,
          intNumber: supplier.intNumber,
        }
      : EMPTY_VALUES,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: supplierSchema },
    onSubmit: ({ value }) => {
      const fields = supplierSchema.parse(value);

      if (supplier) {
        updateSupplier.mutate(
          { ...fields, id: supplier.id },
          {
            onSuccess: () =>
              navigate({
                to: "/suppliers/$supplierId",
                params: { supplierId: supplier.id },
              }),
          }
        );

        return;
      }

      createSupplier.mutate(fields, {
        onSuccess: () => navigate({ to: "/suppliers" }),
      });
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
              <field.TextField
                autoComplete="organization"
                label="Razón social"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="rfc">
            {(field) => (
              <field.TextField
                autoCapitalize="characters"
                label="RFC"
                maxLength={RFC_MAX_LENGTH}
                required
                transform={(value) => value.toUpperCase()}
              />
            )}
          </form.AppField>
          <form.AppField name="phone">
            {(field) => (
              <field.DigitsField
                autoComplete="tel-national"
                label="Teléfono"
                maxLength={PHONE_LENGTH}
                required
              />
            )}
          </form.AppField>
          <form.AppField name="phoneExtension">
            {(field) => <field.DigitsField label="Extensión" maxLength={10} />}
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

      <div className="flex w-full justify-end">
        <div className="flex w-1/2 space-x-4 pt-12 lg:pl-2">
          <Button
            className="w-full"
            disabled={submitting}
            nativeButton={false}
            render={
              supplier ? (
                <Link
                  params={{ supplierId: supplier.id }}
                  to="/suppliers/$supplierId"
                />
              ) : (
                <Link to="/suppliers" />
              )
            }
            variant="outline"
          >
            Cancelar
          </Button>
          <Button className="w-full" disabled={submitting} type="submit">
            {submitting ? <Loader2 className="animate-spin" /> : null}
            {supplier ? "Guardar" : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  );
}
