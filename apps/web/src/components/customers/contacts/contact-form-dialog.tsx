import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@suni/ui/components/dialog";
import type { ComponentProps } from "react";

import { ContactForm } from "./contact-form";

interface ContactFormDialogProps extends Pick<
  ComponentProps<typeof ContactForm>,
  "contact" | "customerId" | "branchId"
> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactFormDialog({
  contact,
  customerId,
  branchId,
  open,
  onOpenChange,
}: ContactFormDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {contact ? "Editar contacto" : "Nuevo contacto"}
          </DialogTitle>
          <DialogDescription>
            {contact
              ? "Actualiza los datos del contacto."
              : "Captura los datos del nuevo contacto."}
          </DialogDescription>
        </DialogHeader>
        <ContactForm
          branchId={branchId}
          contact={contact}
          customerId={customerId}
          onCancel={() => onOpenChange(false)}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
