import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@suni/ui/components/alert-dialog";
import { Button } from "@suni/ui/components/button";
import { useBlocker } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";

interface PurchaseLeaveDialogProps {
  hasChanges: () => boolean;
  canSave: () => boolean;
  saving: boolean;
  onSave: (proceed: () => void, reset: () => void) => void;
}

export function PurchaseLeaveDialog({
  hasChanges,
  canSave,
  saving,
  onSave,
}: PurchaseLeaveDialogProps) {
  const blocker = useBlocker({
    shouldBlockFn: hasChanges,
    enableBeforeUnload: hasChanges,
    withResolver: true,
  });

  if (blocker.status !== "blocked") {
    return null;
  }

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !saving) {
          blocker.reset();
        }
      }}
    >
      <AlertDialogContent>
        <div className="flex items-start gap-3">
          <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-full">
            <CircleAlert aria-hidden className="size-4" />
          </span>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir de la orden de compra?</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar. Puedes guardar un borrador para
              continuar después.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <Button
            disabled={saving}
            onClick={() => blocker.reset()}
            type="button"
            variant="outline"
          >
            Continuar editando
          </Button>
          <Button
            disabled={saving}
            onClick={() => blocker.proceed()}
            type="button"
            variant="destructive"
          >
            Salir sin guardar
          </Button>
          <Button
            disabled={saving || !canSave()}
            onClick={() => onSave(blocker.proceed, blocker.reset)}
            type="button"
          >
            {saving ? "Guardando…" : "Guardar borrador"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
