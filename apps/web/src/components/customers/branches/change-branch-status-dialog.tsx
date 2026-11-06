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

import { useArchiveBranch } from "@/hooks/use-branches";

type BranchRow = AppRouterOutputs["branches"]["list"][number];

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

interface ChangeBranchStatusDialogProps {
  branch: Pick<BranchRow, "id" | "customerId" | "name" | "archived">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeBranchStatusDialog({
  branch,
  open,
  onOpenChange,
}: ChangeBranchStatusDialogProps) {
  const action = branch.archived ? ACTIONS.unarchive : ACTIONS.archive;
  const mutation = useArchiveBranch();

  return (
    <AlertDialog
      onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}
      open={open}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Quieres {action.label.toLowerCase()} la sucursal {branch.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action.description} la sucursal{" "}
            <span className={`font-bold ${action.nameClassName}`}>
              {branch.name}
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
                  id: branch.id,
                  name: branch.name,
                  archived: !branch.archived,
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
