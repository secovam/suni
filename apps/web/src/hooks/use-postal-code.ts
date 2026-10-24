import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { ENV } from "@/env";

const settlementSchema = z.object({
  d_codigo: z.string(),
  d_asenta: z.string(),
  d_tipo_asenta: z.string(),
  d_mnpio: z.string(),
  d_estado: z.string(),
});

const responseSchema = z.object({
  zip_codes: z.array(settlementSchema),
});

export type Settlement = z.infer<typeof settlementSchema>;

export function usePostalCode(zip: string) {
  return useQuery({
    queryKey: ["postal-code", zip],
    enabled: /^\d{5}$/u.test(zip),
    staleTime: Number.POSITIVE_INFINITY,
    retry: 1,
    queryFn: async ({ signal }) => {
      const res = await fetch(
        `${ENV.VITE_SEPOMEX_URL}/api/v1/zip_codes?zip_code=${zip}&per_page=200`,
        { signal }
      );

      if (!res.ok) {
        throw new Error("No se pudo consultar el código postal");
      }

      const json = responseSchema.parse(await res.json());

      return json.zip_codes.filter((s) => s.d_codigo === zip);
    },
  });
}
