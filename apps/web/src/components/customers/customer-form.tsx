import type { AppRouterOutputs } from "@suni/api/routers/index";
import {
  ACQUISITION_CHANNELS,
  CUSTOMER_TYPES,
} from "@suni/db/schema/customer-enums";
import { customerSchema } from "@suni/db/validation/customers";
import { Button } from "@suni/ui/components/button";
import { revalidateLogic, useSelector } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

import { useAppForm } from "@/components/form/use-app-form";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { POSTAL_CODE_LENGTH, useAddressLookup } from "@/hooks/use-postal-code";

type FormValues = Omit<z.input<typeof customerSchema>, "acquisition"> & {
  acquisition: (typeof ACQUISITION_CHANNELS)[number] | "";
};

interface CustomerFormProps {
  customer?: AppRouterOutputs["customers"]["get"];
}

const RFC_MAX_LENGTH = 13;

const PHONE_LENGTH = 10;

const FILLED_BY_POSTAL_CODE = "Se llena con el código postal";

const EMPTY_VALUES: FormValues = {
  name: "",
  rfc: "",
  phone: "",
  phoneExtension: "",
  acquisition: "",
  type: "Cliente",
  postalCode: "",
  suburb: "",
  city: "",
  state: "",
  street: "",
  extNumber: "",
  intNumber: "",
};

function toFormValues(customer?: CustomerFormProps["customer"]): FormValues {
  if (!customer) {
    return EMPTY_VALUES;
  }

  return {
    name: customer.name,
    rfc: customer.rfc,
    phone: customer.phone,
    phoneExtension: customer.phoneExtension,
    acquisition: customer.acquisition,
    type: customer.type,
    postalCode: customer.postalCode,
    suburb: customer.suburb,
    city: customer.city,
    state: customer.state,
    street: customer.street,
    extNumber: customer.extNumber,
    intNumber: customer.intNumber,
  };
}

const ACQUISITION_OPTIONS = ACQUISITION_CHANNELS.map((value) => ({
  value,
  label: value,
}));

const TYPE_OPTIONS = CUSTOMER_TYPES.map((value) => ({ value, label: value }));

export function CustomerForm({ customer }: CustomerFormProps) {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const submitting = createCustomer.isPending || updateCustomer.isPending;

  const goToCustomer = (customerId: string) =>
    navigate({ to: "/customers/$customerId", params: { customerId } });

  const form = useAppForm({
    defaultValues: toFormValues(customer),
    // Valida al enviar y, después del primer envío, en cada cambio.
    validationLogic: revalidateLogic(),
    validators: { onDynamic: customerSchema },
    onSubmit: ({ value }) => {
      const parsed = customerSchema.parse(value);

      if (customer) {
        updateCustomer.mutate(
          { id: customer.id, ...parsed },
          { onSuccess: () => goToCustomer(customer.id) }
        );
      } else {
        createCustomer.mutate(parsed, {
          // insert().returning() is typed as possibly empty.
          onSuccess: (created) => created && goToCustomer(created.id),
        });
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
          <form.AppField name="acquisition">
            {(field) => (
              <field.SelectField
                label="Medio de adquisición"
                options={ACQUISITION_OPTIONS}
                placeholder="Selecciona el medio de adquisición..."
                required
              />
            )}
          </form.AppField>
          {isAdmin ? (
            <form.AppField name="type">
              {(field) => (
                <field.SelectField
                  label="Tipo"
                  options={TYPE_OPTIONS}
                  required
                />
              )}
            </form.AppField>
          ) : null}
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
              customer ? (
                <Link
                  params={{ customerId: customer.id }}
                  to="/customers/$customerId"
                />
              ) : (
                <Link to="/customers" />
              )
            }
            variant="outline"
          >
            Cancelar
          </Button>
          <Button className="w-full" disabled={submitting} type="submit">
            {submitting ? <Loader2 className="animate-spin" /> : null}
            {customer ? "Guardar" : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  );
}
