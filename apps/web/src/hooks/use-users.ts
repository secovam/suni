import type { AppRouterInputs } from "@suni/api/routers/index";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

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
