import { customerFormSchema } from "@suni/db/validation/customers";
import { Button } from "@suni/ui/components/button";
import { Form } from "@suni/ui/components/form";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { useCreateCustomer } from "@/hooks/use-customers";
import { useIsAdmin } from "@/hooks/use-is-admin";

import { BasicInfoSection, ContactAndMetaSection } from "./form-sections";
import type { CustomerFormValues } from "./form-sections";
import { LocationSection } from "./location-form";

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
  acquisition: "",
  type: "Cliente",
};

export function CustomerCreateForm() {
  const navigate = useNavigate();
  const createCustomer = useCreateCustomer();

  const isAdmin = useIsAdmin();
  const submitting = createCustomer.isPending;

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: customerFormSchema },
    onSubmit: ({ value }) => {
      createCustomer.mutate(customerFormSchema.parse(value), {
        onSuccess: (customer) => {
          if (customer) {
            navigate({
              to: "/customers/$customerId",
              params: { customerId: customer.id },
            });
          }
        },
      });
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
