import { createFileRoute } from "@tanstack/react-router";
import { SquareChartGantt } from "lucide-react";

import { CustomerUpdateForm } from "@/components/customers/update-form";
import { useGetCustomer } from "@/hooks/use-customers";

export const Route = createFileRoute("/_auth/customers/$customerId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { customerId } = Route.useParams();
  const { data: customer, isLoading } = useGetCustomer(customerId);

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  if (!customer) {
    return <p>Cliente no encontrado...</p>;
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-success mb-6 flex items-center text-2xl font-bold">
        <SquareChartGantt className="text-success mr-2" /> Editar Cliente
      </h1>
      <CustomerUpdateForm customer={customer} key={customer.id} />
    </div>
  );
}
