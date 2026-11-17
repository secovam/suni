import type {
  AppRouterInputs,
  AppRouterOutputs,
} from "@suni/api/routers/index";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { client, orpc } from "@/utils/orpc";

type ContactRow = AppRouterOutputs["contacts"]["list"][number];

export function useListContacts(params: AppRouterInputs["contacts"]["list"]) {
  return useQuery(
    orpc.contacts.list.queryOptions({
      input: params,
      placeholderData: keepPreviousData,
    })
  );
}

export function useCreateContact() {
  return useMutation(
    orpc.contacts.create.mutationOptions({
      onSuccess: () => {
        toast.success("Contacto creado");
      },
      onError: (error) => toast.error(error.message),
    })
  );
}

export function useUpdateContact() {
  return useMutation(
    orpc.contacts.update.mutationOptions({
      onSuccess: () => {
        toast.success("Contacto actualizado");
      },
      onError: (error) => toast.error(error.message),
    })
  );
}

export function useArchiveContact() {
  return useMutation({
    mutationFn: ({
      id,
      archived,
    }: Pick<ContactRow, "id" | "name"> & { archived: boolean }) =>
      client.contacts.setArchived({ id, archived }),
    onSuccess: (_data, { archived, name }) => {
      toast.success(archived ? "Contacto archivado" : "Contacto desarchivado", {
        description: `Se ${archived ? "archivó" : "desarchivó"} a ${name} con éxito.`,
      });
    },
    onError: (error) => {
      console.error("Error al archivar el contacto:", error);
      toast.error("Algo salió mal...", {
        description:
          "Hubo un error al cambiar el estado del contacto. Intenta de nuevo.",
      });
    },
  });
}
