import type {
  AppRouterInputs,
  AppRouterOutputs,
} from "@suni/api/routers/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client, orpc } from "@/utils/orpc";

type CustomerRow = AppRouterOutputs["customers"]["list"][number];

export function useListCustomers(params: AppRouterInputs["customers"]["list"]) {
  return useQuery(orpc.customers.list.queryOptions({ input: params }));
}

export function useGetCustomer(id: string) {
  return useQuery(orpc.customers.get.queryOptions({ input: { id } }));
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
    mutationFn: (customer: Pick<CustomerRow, "id" | "name" | "archived">) =>
      client.customers.archive({ id: customer.id }),
    onSuccess: async (_data, customer) => {
      await queryClient.invalidateQueries({ queryKey: orpc.customers.key() });
      toast.success(
        customer.archived ? "Cliente desarchivado" : "Cliente archivado",
        {
          description: `Se ${customer.archived ? "desarchivó" : "archivó"} a ${customer.name} con éxito.`,
        }
      );
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
