import { createFileRoute, redirect } from "@tanstack/react-router";
import { Truck } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { SupplierForm } from "@/components/suppliers/supplier-form";

export const Route = createFileRoute("/_auth/suppliers/new")({
  beforeLoad: ({ context }) => {
    if (context.session.user.role !== "admin") {
      throw redirect({ to: "/suppliers" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Registra un proveedor en el directorio"
        icon={Truck}
        title="Nuevo proveedor"
      />
      <SupplierForm />
    </div>
  );
}
