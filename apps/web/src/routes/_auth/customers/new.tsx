import { createFileRoute } from "@tanstack/react-router";
import { ContactRound } from "lucide-react";

import { CustomerForm } from "@/components/customers/customer-form";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_auth/customers/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Crea un nuevo cliente para el sistema"
        icon={ContactRound}
        title="Nuevo Cliente"
      />
      <CustomerForm />
    </div>
  );
}
