import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@suni/ui/components/dialog";
import type { ComponentProps } from "react";

import { BranchForm } from "./branch-form";

interface BranchFormDialogProps extends Pick<
  ComponentProps<typeof BranchForm>,
  "branch" | "customerId"
> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BranchFormDialog({
  branch,
  customerId,
  open,
  onOpenChange,
}: BranchFormDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {branch ? "Editar sucursal" : "Nueva sucursal"}
          </DialogTitle>
          <DialogDescription>
            {branch
              ? "Actualiza los datos de la sucursal."
              : "Captura los datos de la nueva sucursal."}
          </DialogDescription>
        </DialogHeader>
        <BranchForm
          branch={branch}
          customerId={customerId}
          onCancel={() => onOpenChange(false)}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
