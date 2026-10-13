import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export function useUsers(params: {
  limit?: number;
  offset?: number;
  search?: string;
}) {
  return useQuery(
    orpc.users.list.queryOptions({
      input: params,
      placeholderData: keepPreviousData,
    })
  );
}

export function useUser(id: string) {
  return useQuery(
    orpc.users.get.queryOptions({
      input: { id },
    })
  );
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.users.create.mutationOptions({
      onSuccess: () => {
        toast.success("Usuario creado");
        queryClient.invalidateQueries({ queryKey: orpc.users.key() });
      },
      onError: (error) => toast.error(error.message),
    })
  );
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.users.update.mutationOptions({
      onSuccess: () => {
        toast.success("Usuario actualizado");
        queryClient.invalidateQueries({ queryKey: orpc.users.key() });
      },
      onError: (error) => toast.error(error.message),
    })
  );
}
