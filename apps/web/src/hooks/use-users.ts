import type {
  AppRouterInputs,
  AppRouterOutputs,
} from "@suni/api/routers/index";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

type UserRow = AppRouterOutputs["users"]["list"]["items"][number];

export function useListUsers(params: AppRouterInputs["users"]["list"]) {
  return useQuery(
    orpc.users.list.queryOptions({
      input: params,
      placeholderData: keepPreviousData,
    })
  );
}

export function useCreateUser() {
  return useMutation(
    orpc.users.create.mutationOptions({
      onSuccess: () => {
        toast.success("Usuario creado");
      },
      onError: (error) => toast.error(error.message),
    })
  );
}

export function useUpdateUser() {
  return useMutation(
    orpc.users.update.mutationOptions({
      onSuccess: () => {
        toast.success("Usuario actualizado");
      },
      onError: (error) => toast.error(error.message),
    })
  );
}

export function useChangeUserStatus() {
  return useMutation({
    mutationFn: async (user: Pick<UserRow, "id" | "name" | "banned">) => {
      const { error } = user.banned
        ? await authClient.admin.unbanUser({ userId: user.id })
        : await authClient.admin.banUser({
            userId: user.id,
            banReason: "Suspendido por el administrador",
          });

      if (error) {
        throw new Error(error.message ?? "Error desconocido");
      }
    },
    onSuccess: (_data, user) => {
      toast.success(user.banned ? "Usuario activado" : "Usuario suspendido", {
        description: `Se ${user.banned ? "activó" : "suspendió"} el usuario de ${user.name} con éxito.`,
      });
    },
    onError: (error) => {
      console.error("Error al cambiar el estado del usuario:", error);
      toast.error("Algo salió mal...", {
        description:
          "Hubo un error al cambiar el estado del usuario. Intenta de nuevo.",
      });
    },
  });
}

function throwOnError({ error }: { error: { message?: string } | null }) {
  if (error) {
    throw new Error(error.message ?? "Error desconocido");
  }
}

// A full reload swaps the session in the route context and drops every cached query.
function reloadAsCurrentSession() {
  window.location.assign("/dashboard");
}

export function useImpersonateUser() {
  return useMutation({
    mutationFn: async (userId: string) => {
      throwOnError(await authClient.admin.impersonateUser({ userId }));
    },
    onSuccess: reloadAsCurrentSession,
    onError: () => toast.error("No se pudo suplantar al usuario."),
  });
}

export function useStopImpersonating() {
  return useMutation({
    mutationFn: async () => {
      throwOnError(await authClient.admin.stopImpersonating());
    },
    onSuccess: reloadAsCurrentSession,
    onError: () => toast.error("No se pudo volver a tu cuenta."),
  });
}
