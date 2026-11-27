import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { PurchaseForm } from "@/components/purchases/purchase-form";

export const Route = createFileRoute("/_auth/purchases/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Agrega las partidas. El sistema las agrupa por proveedor."
        icon={ClipboardList}
        title="Nueva compra"
      />
      <PurchaseForm />
    </div>
  );
}
