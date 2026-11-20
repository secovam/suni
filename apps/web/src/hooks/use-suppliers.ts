import type { AppRouterInputs } from "@suni/api/routers/index";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export function useListSuppliers(params: AppRouterInputs["suppliers"]["list"]) {
  return useQuery(orpc.suppliers.list.queryOptions({ input: params }));
}

export function useCreateSupplier() {
  return useMutation(
    orpc.suppliers.create.mutationOptions({
      onSuccess: () => toast.success("Proveedor creado"),
      onError: (error) => toast.error(error.message),
    })
  );
}

export function supplierQueryOptions(id: string) {
  return orpc.suppliers.get.queryOptions({ input: { id } });
}

export function useGetSupplier(id: string) {
  return useSuspenseQuery(supplierQueryOptions(id));
}

export function useUpdateSupplier() {
  return useMutation(
    orpc.suppliers.update.mutationOptions({
      onSuccess: () => toast.success("Proveedor actualizado"),
      onError: (error) => toast.error(error.message),
    })
  );
}

export function useSetSupplierArchived() {
  return useMutation(
    orpc.suppliers.setArchived.mutationOptions({
      onSuccess: (_data, { archived }) =>
        toast.success(
          archived ? "Proveedor archivado" : "Proveedor desarchivado"
        ),
      onError: (error) => toast.error(error.message),
    })
  );
}
