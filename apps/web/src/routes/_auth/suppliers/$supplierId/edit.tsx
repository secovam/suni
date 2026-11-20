import { createFileRoute, redirect } from "@tanstack/react-router";
import { Truck } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { supplierQueryOptions, useGetSupplier } from "@/hooks/use-suppliers";

export const Route = createFileRoute("/_auth/suppliers/$supplierId/edit")({
  beforeLoad: ({ context, params: { supplierId } }) => {
    if (context.session.user.role !== "admin") {
      throw redirect({ to: "/suppliers/$supplierId", params: { supplierId } });
    }
  },
  loader: async ({ context: { queryClient }, params: { supplierId } }) => {
    const supplier = await queryClient.query(supplierQueryOptions(supplierId));

    if (supplier.archived) {
      throw redirect({ to: "/suppliers/$supplierId", params: { supplierId } });
    }
  },
  component: RouteComponent,
  errorComponent: () => (
    <p className="text-destructive text-sm" role="alert">
      No se pudo cargar el proveedor.
    </p>
  ),
});

function RouteComponent() {
  const { supplierId } = Route.useParams();
  const { data: supplier } = useGetSupplier(supplierId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description={supplier.name}
        icon={Truck}
        title="Editar proveedor"
      />
      <SupplierForm key={supplier.id} supplier={supplier} />
    </div>
  );
}
