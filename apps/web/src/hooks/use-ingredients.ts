import type { AppRouterInputs } from "@suni/api/routers/index";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export function useListIngredients(
  params: AppRouterInputs["ingredients"]["list"]
) {
  return useQuery(orpc.ingredients.list.queryOptions({ input: params }));
}

export function useCreateIngredient() {
  return useMutation(
    orpc.ingredients.create.mutationOptions({
      onSuccess: () => toast.success("Ingrediente creado"),
      onError: (error) => toast.error(error.message),
    })
  );
}

export function ingredientQueryOptions(id: string) {
  return orpc.ingredients.get.queryOptions({ input: { id } });
}

export function useGetIngredient(id: string) {
  return useSuspenseQuery(ingredientQueryOptions(id));
}

export function useUpdateIngredient() {
  return useMutation(
    orpc.ingredients.update.mutationOptions({
      onSuccess: () => toast.success("Ingrediente actualizado"),
      onError: (error) => toast.error(error.message),
    })
  );
}

export function useSetIngredientArchived() {
  return useMutation(
    orpc.ingredients.setArchived.mutationOptions({
      onSuccess: (_data, { archived }) =>
        toast.success(
          archived ? "Ingrediente archivado" : "Ingrediente desarchivado"
        ),
      onError: (error) => toast.error(error.message),
    })
  );
}
