import type {
  AppRouterInputs,
  AppRouterOutputs,
} from "@suni/api/routers/index";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import type { skipToken } from "@tanstack/react-query";
import { toast } from "sonner";

import { client, orpc } from "@/utils/orpc";

type BranchRow = AppRouterOutputs["branches"]["list"][number];

export function useListBranches(
  params: AppRouterInputs["branches"]["list"] | typeof skipToken
) {
  return useQuery(
    orpc.branches.list.queryOptions({
      input: params,
      placeholderData: keepPreviousData,
    })
  );
}

export function useCreateBranch() {
  return useMutation(
    orpc.branches.create.mutationOptions({
      onSuccess: () => {
        toast.success("Sucursal creada");
      },
      onError: (error) => toast.error(error.message),
    })
  );
}

export function useUpdateBranch() {
  return useMutation(
    orpc.branches.update.mutationOptions({
      onSuccess: () => {
        toast.success("Sucursal actualizada");
      },
      onError: (error) => toast.error(error.message),
    })
  );
}

export function useArchiveBranch() {
  return useMutation({
    mutationFn: ({
      id,
      archived,
    }: Pick<BranchRow, "id" | "name"> & { archived: boolean }) =>
      client.branches.setArchived({ id, archived }),
    onSuccess: (_data, { archived, name }) => {
      toast.success(archived ? "Sucursal archivada" : "Sucursal desarchivada", {
        description: `Se ${archived ? "archivó" : "desarchivó"} ${name} con éxito.`,
      });
    },
    onError: (error) => {
      console.error("Error al archivar la sucursal:", error);
      toast.error("Algo salió mal...", {
        description:
          "Hubo un error al cambiar el estado de la sucursal. Intenta de nuevo.",
      });
    },
  });
}
