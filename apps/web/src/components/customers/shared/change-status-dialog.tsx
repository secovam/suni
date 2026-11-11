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

interface ArchiveMutation {
  isPending: boolean;
  mutate: (
    variables: { id: string; name: string; archived: boolean },
    options: { onSuccess: () => void }
  ) => void;
}

interface ChangeStatusDialogProps {
  entity: { id: string; name: string; archived: unknown };
  /** Article and noun before the name, e.g. "la sucursal". */
  noun: string;
  mutation: ArchiveMutation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeStatusDialog({
  entity,
  noun,
  mutation,
  open,
  onOpenChange,
}: ChangeStatusDialogProps) {
  const action = entity.archived ? ACTIONS.unarchive : ACTIONS.archive;

  return (
    <AlertDialog
      onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}
      open={open}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Quieres {action.label.toLowerCase()} {noun} {entity.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action.description} {noun}{" "}
            <span className={`font-bold ${action.nameClassName}`}>
              {entity.name}
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
                  id: entity.id,
                  name: entity.name,
                  archived: !entity.archived,
                },
                { onSuccess: () => onOpenChange(false) }
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
