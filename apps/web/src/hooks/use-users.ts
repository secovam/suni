import type {
  AppRouterInputs,
  AppRouterOutputs,
} from "@suni/api/routers/index";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  return useMutation(
    orpc.users.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Usuario creado");
        await queryClient.invalidateQueries({ queryKey: orpc.users.key() });
      },
      onError: (error) => toast.error(error.message),
    })
  );
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.users.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Usuario actualizado");
        await queryClient.invalidateQueries({ queryKey: orpc.users.key() });
      },
      onError: (error) => toast.error(error.message),
    })
  );
}

export function useChangeUserStatus() {
  const queryClient = useQueryClient();

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
    onSuccess: async (_data, user) => {
      await queryClient.invalidateQueries({ queryKey: orpc.users.key() });
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
