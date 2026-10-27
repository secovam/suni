import {
  ACQUISITION_CHANNELS,
  CUSTOMER_TYPES,
} from "@suni/db/schema/customer-enums";
import { Button } from "@suni/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@suni/ui/components/form";
import { Input } from "@suni/ui/components/input";
import { ReactSelect } from "@suni/ui/components/react-select";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { useCreateCustomer } from "@/hooks/use-customers";

import { LocationSection } from "./location-form";

const required = (message = "Campo requerido") =>
  z.string().trim().min(1, message);

// Mover schema y secciones a archivos propios
// oxlint-disable-next-line react-doctor/only-export-components
export const customerFormSchema = z.object({
  name: required("La razón social es requerida"),
  rfc: z.string().regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/u, "RFC inválido"),
  street: required("La calle es requerida"),
  intNumber: z.string(),
  extNumber: required("El número exterior es requerido"),
  city: required("El municipio es requerido"),
  suburb: required("La colonia es requerida"),
  state: required("El estado es requerido"),
  postalCode: z.string().regex(/^\d{5}$/u, "Debe tener 5 dígitos"),
  phone: z.string().regex(/^(?:\d{10})?$/u, "Debe tener 10 dígitos"),
  phoneExtension: z.string(),
  acquisition: z.enum(ACQUISITION_CHANNELS, {
    message: "Selecciona un medio de adquisición",
  }),
  type: z.enum(CUSTOMER_TYPES),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

const defaultValues: CustomerFormValues = {
  name: "",
  rfc: "",
  street: "",
  intNumber: "",
  extNumber: "",
  city: "",
  suburb: "",
  state: "",
  postalCode: "",
  phone: "",
  phoneExtension: "",
  // SAFETY: Initial empty state for the form before user selection
  acquisition: "" as CustomerFormValues["acquisition"],
  type: "Cliente",
};

const acquisitionOptions = ACQUISITION_CHANNELS.map((value) => ({
  value,
  label: value,
}));

const typeOptions = CUSTOMER_TYPES.map((value) => ({
  value,
  label: value,
}));

const onlyDigits = (value: string) => value.replaceAll(/\D/gu, "");

export function BasicInfoSection() {
  return (
    <>
      <FormField
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Razón Social<span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Razón Social SA de CV"
                type="text"
                value={field.state.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="rfc"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              RFC<span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                maxLength={13}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value.toUpperCase().replaceAll(/[^A-Z0-9Ñ&]/gu, "")
                  )
                }
                placeholder="AAA010101AAA"
                type="text"
                value={field.state.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function ContactAndMetaSection({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      <div className="flex space-x-4">
        <FormField
          name="phone"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  maxLength={10}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(onlyDigits(e.target.value))
                  }
                  placeholder="8112341234"
                  value={field.state.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="phoneExtension"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>No. Extensión</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  maxLength={10}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(onlyDigits(e.target.value))
                  }
                  placeholder="3412"
                  value={field.state.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        name="acquisition"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Medio de adquisición
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <ReactSelect
                isClearable
                onBlur={field.handleBlur}
                onChange={(option) =>
                  field.handleChange(
                    // SAFETY: Ensuring type safety when mapping option value to form acquisition type
                    (option?.value ?? "") as CustomerFormValues["acquisition"]
                  )
                }
                options={acquisitionOptions}
                placeholder="Selecciona un medio..."
                value={
                  acquisitionOptions.find(
                    (opt) => opt.value === field.state.value
                  ) ?? null
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isAdmin && (
        <FormField
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tipo<span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <ReactSelect
                  onBlur={field.handleBlur}
                  onChange={(option) => {
                    if (option) {
                      field.handleChange(option.value);
                    }
                  }}
                  options={typeOptions}
                  placeholder="Selecciona un tipo..."
                  value={
                    typeOptions.find(
                      (opt) => opt.value === field.state.value
                    ) ?? null
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}

export function CustomerCreateForm() {
  const navigate = useNavigate();
  const createCustomer = useCreateCustomer();

  const session = useRouteContext({
    from: "/_auth",
    select: (ctx) => ctx.session,
  });

  const isAdmin = session.user.role === "admin";
  const submitting = createCustomer.isPending;

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: customerFormSchema },
    onSubmit: ({ value }) => {
      createCustomer.mutate(
        {
          ...value,
          intNumber: value.intNumber || null,
          phone: value.phone || null,
          phoneExtension: value.phoneExtension || null,
        },
        {
          onSuccess: (customer) => {
            if (customer?.id) {
              navigate({
                to: "/customers/$customerId",
                params: { customerId: customer.id },
              });
            }
          },
        }
      );
    },
  });

  return (
    <Form form={form}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BasicInfoSection />
          <LocationSection form={form} />
          <ContactAndMetaSection isAdmin={isAdmin} />
        </div>

        <div className="flex w-full justify-end">
          <div className="flex w-1/2 space-x-4 pt-12 lg:pl-2">
            <Button
              className="w-full"
              disabled={submitting}
              nativeButton={false}
              render={<Link to="/customers" />}
              variant="outline-destructive"
            >
              Cancelar
            </Button>
            <Button
              className="w-full"
              disabled={submitting}
              type="submit"
              variant="green"
            >
              {submitting ? <Loader2 className="animate-spin" /> : null}
              {submitting ? "Creando..." : "Crear"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
