import { createFileRoute, redirect } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { PurchaseForm } from "@/components/purchases/purchase-form";
import { purchaseQueryOptions } from "@/hooks/use-purchases";

export const Route = createFileRoute("/_auth/purchases/$purchaseId/edit")({
  loader: async ({ context: { queryClient }, params: { purchaseId } }) => {
    const purchase = await queryClient.query(
      purchaseQueryOptions({ id: purchaseId })
    );

    if (purchase.scope !== "purchase" || purchase.status !== "draft") {
      throw redirect({
        to: "/purchases/$purchaseId",
        params: { purchaseId },
        replace: true,
      });
    }

    return purchase;
  },
  component: RouteComponent,
  errorComponent: () => (
    <p className="text-destructive text-sm" role="alert">
      No se pudo cargar el borrador.
    </p>
  ),
});

function RouteComponent() {
  const draft = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description={draft.folio}
        icon={ClipboardList}
        title="Editar borrador de compra"
      />
      <PurchaseForm draft={draft} key={draft.id} />
    </div>
  );
}
