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
  AlertDialogTrigger,
} from "@suni/ui/components/alert-dialog";
import { Button } from "@suni/ui/components/button";
import { Ban, CircleCheckBig } from "lucide-react";
import { useState } from "react";

import { useChangeUserStatus } from "@/hooks/use-users";

type UserRow = AppRouterOutputs["users"]["list"]["items"][number];

// What the dialog shows when suspending an active user vs. activating a suspended one.
const ACTIONS = {
  suspend: {
    label: "Suspender",
    Icon: Ban,
    triggerVariant: "outline-destructive",
    confirmVariant: "destructive",
    emailClassName: "text-destructive",
    description: "Esto suspenderá",
  },
  activate: {
    label: "Activar",
    Icon: CircleCheckBig,
    triggerVariant: "outline-green",
    confirmVariant: "default",
    emailClassName: "text-success",
    description: "Esto reactivará",
  },
} as const;

interface ChangeUserStatusDialogProps {
  user: Pick<UserRow, "id" | "name" | "email" | "banned">;
  disabled?: boolean;
}

export function ChangeUserStatusDialog({
  user,
  disabled,
}: ChangeUserStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const action = user.banned ? ACTIONS.activate : ACTIONS.suspend;
  const mutation = useChangeUserStatus();

  return (
    <AlertDialog
      // Keep the dialog open while the request is in flight.
      onOpenChange={(next) => !mutation.isPending && setOpen(next)}
      open={open}
    >
      <AlertDialogTrigger
        render={
          <Button
            disabled={disabled}
            size="icon-sm"
            title={
              disabled ? "No puedes cambiar tu propio estado" : action.label
            }
            variant={action.triggerVariant}
          />
        }
      >
        <action.Icon className="size-4" />
        <span className="sr-only">{action.label}</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Quieres {action.label.toLowerCase()} el usuario de {user.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action.description} el acceso del usuario{" "}
            <span className={`font-bold ${action.emailClassName}`}>
              {user.email}
            </span>{" "}
            a la aplicación.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate(user, { onSuccess: () => setOpen(false) })
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
