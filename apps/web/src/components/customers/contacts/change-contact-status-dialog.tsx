import type { AppRouterOutputs } from "@suni/api/routers/index";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@suni/ui/components/alert-dialog";

import { useArchiveContact } from "@/hooks/use-contacts";

type ContactRow = AppRouterOutputs["contacts"]["list"][number];

const ACTIONS = {
  archive: {
    label: "Archivar",
    confirmVariant: "destructive",
    nameClassName: "text-destructive",
    description: "Esto archivará",
  },
  unarchive: {
    label: "Desarchivar",
    confirmVariant: "default",
    nameClassName: "text-success",
    description: "Esto restaurará",
  },
} as const;

interface ChangeContactStatusDialogProps {
  contact: Pick<ContactRow, "id" | "name" | "archived">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeContactStatusDialog({
  contact,
  open,
  onOpenChange,
}: ChangeContactStatusDialogProps) {
  const action = contact.archived ? ACTIONS.unarchive : ACTIONS.archive;
  const mutation = useArchiveContact();

  return (
    <AlertDialog
      onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}
      open={open}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Quieres {action.label.toLowerCase()} al contacto {contact.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action.description} al contacto{" "}
            <span className={`font-bold ${action.nameClassName}`}>
              {contact.name}
            </span>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate(
                {
                  id: contact.id,
                  name: contact.name,
                  archived: !contact.archived,
                },
                {
                  onSuccess: () => onOpenChange(false),
                }
              )
            }
            variant={action.confirmVariant}
          >
            {mutation.isPending ? "Guardando..." : action.label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
