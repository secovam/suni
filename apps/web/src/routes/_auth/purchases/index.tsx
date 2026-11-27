import { purchaseSearchSchema } from "@suni/db/validation/purchase-orders";
import { Button } from "@suni/ui/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { PurchaseFilters } from "@/components/purchases/purchase-filters";
import { PurchaseList } from "@/components/purchases/purchase-list";

export const Route = createFileRoute("/_auth/purchases/")({
  validateSearch: (search) => purchaseSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const filters = Route.useSearch();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        actions={
          <Button nativeButton={false} render={<Link to="/purchases/new" />}>
            <Plus aria-hidden />
            Nueva compra
          </Button>
        }
        description="Consulta compras generales y sus órdenes por proveedor."
        icon={ClipboardList}
        title="Órdenes de compra"
      />
      <PurchaseFilters />
      <PurchaseList input={{ ...filters, scope: "purchase" }} />
    </div>
  );
}
