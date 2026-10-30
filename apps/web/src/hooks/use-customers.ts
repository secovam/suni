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

import { client, orpc } from "@/utils/orpc";

type CustomerRow = AppRouterOutputs["customers"]["list"][number];

export function useListCustomers(params: AppRouterInputs["customers"]["list"]) {
  return useQuery({
    ...orpc.customers.list.queryOptions({ input: params }),
    placeholderData: keepPreviousData,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.customers.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Cliente creado");
        await queryClient.invalidateQueries({ queryKey: orpc.customers.key() });
      },
      onError: (error) => toast.error(error.message),
    })
  );
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.customers.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Cliente actualizado");
        await queryClient.invalidateQueries({ queryKey: orpc.customers.key() });
      },
      onError: (error) => toast.error(error.message),
    })
  );
}

export function useArchiveCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    // `archived` is the state the user confirmed in the dialog, sent as-is so a
    // stale list cannot flip the customer the wrong way.
    mutationFn: ({
      id,
      archived,
    }: Pick<CustomerRow, "id" | "name"> & { archived: boolean }) =>
      client.customers.setArchived({ id, archived }),
    onSuccess: async (_data, { archived, name }) => {
      await queryClient.invalidateQueries({ queryKey: orpc.customers.key() });
      toast.success(archived ? "Cliente archivado" : "Cliente desarchivado", {
        description: `Se ${archived ? "archivó" : "desarchivó"} a ${name} con éxito.`,
      });
    },
    onError: (error) => {
      console.error("Error al archivar el cliente:", error);
      toast.error("Algo salió mal...", {
        description:
          "Hubo un error al cambiar el estado del cliente. Intenta de nuevo.",
      });
    },
  });
}
