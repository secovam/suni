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
import { Send } from "lucide-react";
import { useState } from "react";
import type { RefObject } from "react";

import { useUpdatePurchase } from "@/hooks/use-purchases";

interface SendPurchaseButtonProps {
  id: string;
  folio: string;
  finalFocus: RefObject<HTMLElement | null>;
}

export function SendPurchaseButton({
  id,
  folio,
  finalFocus,
}: SendPurchaseButtonProps) {
  const [open, setOpen] = useState(false);
  const update = useUpdatePurchase();

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!update.isPending) {
          setOpen(next);
        }
      }}
    >
      <AlertDialogTrigger render={<Button size="sm" type="button" />}>
        <Send aria-hidden />
        Enviar orden
      </AlertDialogTrigger>
      <AlertDialogContent finalFocus={finalFocus}>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Enviar orden de compra?</AlertDialogTitle>
          <AlertDialogDescription>
            La compra <strong className="break-all">{folio}</strong> pasará a
            Enviada junto con sus órdenes vigentes. Esta acción no envía correos
            a los proveedores.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={update.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={update.isPending}
            onClick={() =>
              update.mutate(
                { id, status: "sent" },
                { onSuccess: () => setOpen(false) }
              )
            }
          >
            {update.isPending ? "Guardando…" : "Confirmar envío"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
