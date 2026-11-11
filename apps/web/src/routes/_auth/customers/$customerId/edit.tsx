import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SquareChartGantt } from "lucide-react";

import { CustomerForm } from "@/components/customers/customer-form";
import { PageHeader } from "@/components/page-header";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_auth/customers/$customerId/edit")({
  loader: ({ context: { queryClient }, params: { customerId } }) =>
    queryClient.query(
      orpc.customers.get.queryOptions({ input: { id: customerId } })
    ),
  component: RouteComponent,
  errorComponent: () => (
    <p className="text-destructive text-sm">No se pudo cargar el cliente.</p>
  ),
});

function RouteComponent() {
  const { customerId } = Route.useParams();

  // Reads the query cache, not loader data, so saves and archives show up even after a preload.
  const { data: customer } = useSuspenseQuery(
    orpc.customers.get.queryOptions({ input: { id: customerId } })
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Modifica la información del cliente"
        icon={SquareChartGantt}
        title="Editar Cliente"
      />

      <CustomerForm customer={customer} key={customer.id} />
    </div>
  );
}
