import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@suni/ui/components/dialog";

import { ContactForm } from "./contact-form";
import type { ContactFormTarget } from "./contact-form";

type ContactFormDialogProps = ContactFormTarget & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ContactFormDialog({
  open,
  onOpenChange,
  ...target
}: ContactFormDialogProps) {
  const { contact } = target;

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
          {...target}
          onCancel={() => onOpenChange(false)}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
