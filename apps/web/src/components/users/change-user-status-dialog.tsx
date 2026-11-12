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

import { ActionTooltip } from "@/components/users/action-tooltip";
import { useChangeUserStatus } from "@/hooks/use-users";

type UserRow = AppRouterOutputs["users"]["list"]["items"][number];

const BLOCKED_REASON = "No puedes cambiar tu propio estado";

// What the dialog shows when suspending an active user vs. activating a suspended one.
const ACTIONS = {
  suspend: {
    label: "Suspender",
    hint: "Suspender el acceso de este usuario",
    Icon: Ban,
    triggerVariant: "ghost-destructive",
    confirmVariant: "destructive",
    emailClassName: "text-destructive",
    description: "Esto suspenderá",
  },
  activate: {
    label: "Activar",
    hint: "Reactivar el acceso de este usuario",
    Icon: CircleCheckBig,
    triggerVariant: "ghost-success",
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
      <ActionTooltip label={disabled ? BLOCKED_REASON : action.hint}>
        <AlertDialogTrigger
          render={
            <Button
              disabled={disabled}
              // Keeps the tooltip with the blocked reason reachable by keyboard.
              focusableWhenDisabled
              size="icon-sm"
              variant={action.triggerVariant}
            />
          }
        >
          <action.Icon className="size-4" />
          <span className="sr-only">
            {disabled ? BLOCKED_REASON : action.label}
          </span>
        </AlertDialogTrigger>
      </ActionTooltip>
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
