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
import { Archive, ArchiveRestore } from "lucide-react";

import { useArchiveCustomer } from "@/hooks/use-customers";

type CustomerRow = AppRouterOutputs["customers"]["list"][number];

const ACTIONS = {
  archive: {
    label: "Archivar",
    Icon: Archive,
    confirmVariant: "destructive",
    nameClassName: "text-destructive",
    description: "Esto archivará",
  },
  unarchive: {
    label: "Desarchivar",
    Icon: ArchiveRestore,
    confirmVariant: "default",
    nameClassName: "text-success",
    description: "Esto restaurará",
  },
} as const;

interface ChangeCustomerStatusDialogProps {
  customer: Pick<CustomerRow, "id" | "name" | "archived">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeCustomerStatusDialog({
  customer,
  open,
  onOpenChange,
}: ChangeCustomerStatusDialogProps) {
  const action = customer.archived ? ACTIONS.unarchive : ACTIONS.archive;
  const mutation = useArchiveCustomer();

  return (
    <AlertDialog
      onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}
      open={open}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Quieres {action.label.toLowerCase()} a {customer.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action.description} al cliente{" "}
            <span className={`font-bold ${action.nameClassName}`}>
              {customer.name}
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
                  id: customer.id,
                  name: customer.name,
                  archived: !customer.archived,
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
