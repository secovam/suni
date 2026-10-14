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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, CircleCheckBig } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

interface ChangeUserStatusDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
    banned?: boolean | null;
  };
  disabled?: boolean;
}

const BAN_REASON = "Suspendido por el administrador";

export function ChangeUserStatusDialog({
  user,
  disabled,
}: ChangeUserStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isBanned = !!user.banned;

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = isBanned
        ? await authClient.admin.unbanUser({ userId: user.id })
        : await authClient.admin.banUser({
            userId: user.id,
            banReason: BAN_REASON,
          });

      if (error) {
        throw new Error(error.message ?? "Error desconocido");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orpc.users.key() });
      toast.success(isBanned ? "Usuario activado" : "Usuario suspendido", {
        description: isBanned
          ? `Se activó el usuario de ${user.name} con éxito.`
          : `Se suspendió el usuario de ${user.name} con éxito.`,
      });
      setOpen(false);
    },
    onError: (error) => {
      console.error("Error al cambiar el estado del usuario:", error);
      toast.error("Algo salió mal...", {
        description:
          "Hubo un error al cambiar el estado del usuario. Intenta de nuevo.",
      });
    },
  });

  const label = isBanned ? "Activar" : "Suspender";
  const Icon = isBanned ? CircleCheckBig : Ban;

  return (
    <AlertDialog
      onOpenChange={(next) => {
        if (!mutation.isPending) {
          setOpen(next);
        }
      }}
      open={open}
    >
      <AlertDialogTrigger
        render={
          <Button
            disabled={disabled}
            size="icon-sm"
            title={disabled ? "No puedes cambiar tu propio estado" : label}
            variant={isBanned ? "outlineGreen" : "outlineDestructive"}
          />
        }
      >
        <Icon className="size-4" />
        <span className="sr-only">{label}</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Quieres {label.toLowerCase()} el usuario de {user.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBanned ? "Esto restaurará" : "Esto suspenderá"} el acceso del
            usuario{" "}
            <span
              className={
                isBanned
                  ? "text-success font-bold"
                  : "text-destructive font-bold"
              }
            >
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
            onClick={() => mutation.mutate()}
            variant={isBanned ? "default" : "destructive"}
          >
            {mutation.isPending ? "Guardando..." : label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
