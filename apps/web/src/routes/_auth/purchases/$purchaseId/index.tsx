import { purchaseIdSchema } from "@suni/db/validation/purchase-orders";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@suni/ui/components/alert-dialog";
import { Button } from "@suni/ui/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Truck } from "lucide-react";
import { useRef, useState } from "react";
import type { RefObject } from "react";

import { PageHeader } from "@/components/page-header";
import { PurchaseDetails } from "@/components/purchases/purchase-details";
import { PurchaseStatus } from "@/components/purchases/purchase-status";
import { SendPurchaseButton } from "@/components/purchases/send-purchase-button";
import {
  purchaseQueryOptions,
  useGetPurchase,
  useUpdatePurchase,
} from "@/hooks/use-purchases";

export const Route = createFileRoute("/_auth/purchases/$purchaseId/")({
  loader: async ({ context: { queryClient }, params }) => {
    const input = purchaseIdSchema.parse({ id: params.purchaseId });

    const entry = await queryClient.query(purchaseQueryOptions(input));

    return {
      input,
      breadcrumbParentId:
        entry.scope === "supplierOrder" ? entry.purchaseId : undefined,
    };
  },
  component: RouteComponent,
  errorComponent: () => (
    <p className="text-destructive text-sm" role="alert">
      No se pudo cargar la orden de compra.
    </p>
  ),
});

function RouteComponent() {
  const { input } = Route.useLoaderData();
  const { data: entry } = useGetPurchase(input);
  const finalFocus = useRef<HTMLDivElement>(null);
  const general = entry.scope === "purchase";

  const singleOrder =
    general && entry.orders.length === 1 ? entry.orders[0] : undefined;

  const supplierName = general ? singleOrder?.supplierName : entry.supplierName;

  const canEdit = general && entry.status === "draft";

  const canCancel =
    entry.status !== "cancelled" && (general || entry.status !== "draft");

  return (
    <div className="flex flex-col gap-6" ref={finalFocus} tabIndex={-1}>
      <PageHeader
        title={supplierName ?? "Compra general"}
        icon={supplierName ? Truck : ClipboardList}
        description={
          <div className="flex flex-wrap items-center gap-2">
            <span className="break-all">{entry.folio}</span>
            <PurchaseStatus
              partial={general && entry.partiallyCancelled}
              status={entry.status}
            />
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {canEdit ? (
              <Button
                nativeButton={false}
                render={
                  <Link
                    params={{ purchaseId: entry.id }}
                    to="/purchases/$purchaseId/edit"
                  />
                }
              >
                Editar borrador
              </Button>
            ) : null}
            {general && entry.status === "generated" ? (
              <SendPurchaseButton
                finalFocus={finalFocus}
                folio={entry.folio}
                id={entry.id}
              />
            ) : null}
            {general && entry.status === "sent" ? (
              <ConfirmPurchaseButton id={entry.id} />
            ) : null}
            {canCancel ? (
              <CancelPurchase
                general={general}
                id={entry.id}
                finalFocus={finalFocus}
              />
            ) : null}
          </div>
        }
      />
      <PurchaseDetails entry={entry} />
    </div>
  );
}

function ConfirmPurchaseButton({ id }: { id: string }) {
  const update = useUpdatePurchase();

  return (
    <Button
      disabled={update.isPending}
      onClick={() => update.mutate({ id, status: "confirmed" })}
    >
      Confirmar compra
    </Button>
  );
}

function CancelPurchase({
  id,
  general,
  finalFocus,
}: {
  id: string;
  general: boolean;
  finalFocus: RefObject<HTMLDivElement | null>;
}) {
  const cancel = useUpdatePurchase();
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!cancel.isPending) {
          setOpen(next);
        }
      }}
    >
      <AlertDialogTrigger render={<Button variant="outline" />}>
        {general ? "Cancelar compra" : "Cancelar orden"}
      </AlertDialogTrigger>
      <AlertDialogContent finalFocus={finalFocus}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {general ? "¿Cancelar esta compra?" : "¿Cancelar esta orden?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {general
              ? "Se cancelarán las órdenes vigentes de esta compra."
              : "Si es la última orden vigente, también se cancelará la compra general."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancel.isPending}>
            Volver
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={cancel.isPending}
            onClick={() =>
              cancel.mutate(
                { id, status: "cancelled" },
                { onSuccess: () => setOpen(false) }
              )
            }
            variant="destructive"
          >
            {cancel.isPending ? "Cancelando…" : "Confirmar cancelación"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
