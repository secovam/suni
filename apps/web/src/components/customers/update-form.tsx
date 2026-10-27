import type { AppRouterOutputs } from "@suni/api/routers/index";
import { customerFormSchema } from "@suni/db/validation/customers";
import { Button } from "@suni/ui/components/button";
import { Form } from "@suni/ui/components/form";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { useUpdateCustomer } from "@/hooks/use-customers";
import { useIsAdmin } from "@/hooks/use-is-admin";

import { BasicInfoSection, ContactAndMetaSection } from "./form-sections";
import type { CustomerFormValues } from "./form-sections";
import { LocationSection } from "./location-form";

type Customer = NonNullable<AppRouterOutputs["customers"]["get"]>;

const toFormValues = (customer: Customer): CustomerFormValues => ({
  name: customer.name,
  rfc: customer.rfc,
  street: customer.street,
  intNumber: customer.intNumber ?? "",
  extNumber: customer.extNumber,
  city: customer.city,
  suburb: customer.suburb,
  state: customer.state,
  postalCode: customer.postalCode,
  phone: customer.phone,
  phoneExtension: customer.phoneExtension ?? "",
  acquisition: customer.acquisition,
  type: customer.type,
});

export function CustomerUpdateForm({ customer }: { customer: Customer }) {
  const navigate = useNavigate();
  const updateCustomer = useUpdateCustomer();

  const isAdmin = useIsAdmin();
  const submitting = updateCustomer.isPending;

  const form = useForm({
    defaultValues: toFormValues(customer),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: customerFormSchema },
    onSubmit: ({ value }) => {
      updateCustomer.mutate(
        { ...customerFormSchema.parse(value), id: customer.id },
        {
          onSuccess: () =>
            navigate({
              to: "/customers/$customerId",
              params: { customerId: customer.id },
            }),
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
              render={
                <Link
                  params={{ customerId: customer.id }}
                  to="/customers/$customerId"
                />
              }
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
              {submitting ? "Editando..." : "Editar"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
