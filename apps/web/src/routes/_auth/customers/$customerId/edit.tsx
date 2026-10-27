import { createFileRoute } from "@tanstack/react-router";
import { SquareChartGantt } from "lucide-react";

import { CustomerForm } from "@/components/customers/customer-form";

export const Route = createFileRoute("/_auth/customers/$customerId/edit")({
  loader: ({ context: { orpc, queryClient }, params: { customerId } }) =>
    queryClient.query(
      orpc.customers.get.queryOptions({ input: { id: customerId } })
    ),
  component: RouteComponent,
  errorComponent: () => (
    <p className="text-destructive p-6 text-sm">
      No se pudo cargar el cliente.
    </p>
  ),
});

function RouteComponent() {
  const customer = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border-border from-muted/60 to-muted/25 flex items-center justify-between rounded-xl border bg-linear-to-r px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <SquareChartGantt className="text-success h-4.5 w-4.5" />
            </div>
            <h1 className="text-success text-xl font-bold">Editar Cliente</h1>
          </div>
          <p className="text-brand mt-2 text-sm">
            Modifica la información del cliente
          </p>
        </div>
      </div>

      <CustomerForm customer={customer} key={customer.id} />
    </div>
  );
}
