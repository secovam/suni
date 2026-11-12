import type { AppRouterOutputs } from "@suni/api/routers/index";
import { contactSchema } from "@suni/db/validation/contacts";
import { Button } from "@suni/ui/components/button";
import { revalidateLogic } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

import { useAppForm } from "@/components/form/use-app-form";
import { useCreateContact, useUpdateContact } from "@/hooks/use-contacts";

type Contact = AppRouterOutputs["contacts"]["list"][number];

type FormValues = z.input<typeof contactSchema>;

export type ContactFormTarget =
  | { contact: Contact }
  | { contact?: never; customerId: string; branchId: string };

type ContactFormProps = ContactFormTarget & {
  onSuccess?: () => void;
  onCancel: () => void;
};

const PHONE_LENGTH = 10;

const EXTENSION_LENGTH = 10;

const EMPTY_VALUES: FormValues = {
  name: "",
  email: "",
  phone: "",
  phoneExtension: "",
  position: "",
};

function toFormValues(contact?: Contact): FormValues {
  if (!contact) {
    return EMPTY_VALUES;
  }

  return {
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    phoneExtension: contact.phoneExtension,
    position: contact.position,
  };
}

export function ContactForm({
  onSuccess,
  onCancel,
  ...target
}: ContactFormProps) {
  const { contact } = target;
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const submitting = createContact.isPending || updateContact.isPending;

  const form = useAppForm({
    defaultValues: toFormValues(contact),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: contactSchema },
    onSubmit: ({ value }) => {
      if (target.contact) {
        updateContact.mutate(
          { id: target.contact.id, ...value },
          { onSuccess: () => onSuccess?.() }
        );
      } else {
        createContact.mutate(
          {
            customerId: target.customerId,
            branchId: target.branchId,
            ...value,
          },
          { onSuccess: () => onSuccess?.() }
        );
      }
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
      <fieldset className="space-y-4">
        <legend className="text-brand mb-4 text-lg font-semibold">
          Datos generales
        </legend>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                autoComplete="name"
                label="Nombre"
                placeholder="Juan Pérez"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="position">
            {(field) => (
              <field.TextField
                autoComplete="organization-title"
                label="Puesto"
                maxLength={255}
                placeholder="Gerente"
              />
            )}
          </form.AppField>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-brand mb-4 text-lg font-semibold">
          Contacto
        </legend>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                autoComplete="email"
                label="Correo"
                placeholder="correo@dominio.com"
                required
              />
            )}
          </form.AppField>
          <div className="grid grid-cols-[2fr_1fr] gap-4">
            <form.AppField name="phone">
              {(field) => (
                <field.DigitsField
                  autoComplete="tel-national"
                  label="Teléfono"
                  maxLength={PHONE_LENGTH}
                  placeholder="8112341234"
                />
              )}
            </form.AppField>
            <form.AppField name="phoneExtension">
              {(field) => (
                <field.DigitsField
                  label="No. extensión"
                  maxLength={EXTENSION_LENGTH}
                  placeholder="3412"
                />
              )}
            </form.AppField>
          </div>
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
          {contact ? "Guardar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
