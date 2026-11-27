import type { AppRouterInputs } from "@suni/api/routers/index";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

type PurchaseInputs = AppRouterInputs["purchases"];

export function useListPurchases(input: PurchaseInputs["list"]) {
  return useQuery(orpc.purchases.list.queryOptions({ input }));
}

export function purchaseQueryOptions(input: PurchaseInputs["get"]) {
  return orpc.purchases.get.queryOptions({ input });
}

export function useGetPurchase(input: PurchaseInputs["get"]) {
  return useSuspenseQuery(purchaseQueryOptions(input));
}

export function useCreatePurchase() {
  return useMutation(
    orpc.purchases.create.mutationOptions({
      onSuccess: (_data, { status }) =>
        toast.success(
          status === "draft" ? "Borrador guardado" : "Orden generada"
        ),
      onError: (error) => toast.error(error.message),
    })
  );
}

export function useUpdatePurchase() {
  return useMutation(
    orpc.purchases.update.mutationOptions({
      onSuccess: (_data, { status }) =>
        toast.success(
          {
            draft: "Borrador actualizado",
            generated: "Orden generada",
            sent: "Orden marcada como enviada",
            confirmed: "Compra confirmada",
            cancelled: "Orden cancelada",
          }[status ?? "generated"]
        ),
      onError: (error) => toast.error(error.message),
    })
  );
}
