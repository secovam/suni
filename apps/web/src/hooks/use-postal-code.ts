import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
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

type Settlement = z.infer<typeof settlementSchema>;

function postalCodeQueryOptions(zip: string) {
  return queryOptions({
    queryKey: ["postal-code", zip],
    enabled: /^\d{5}$/u.test(zip),
    staleTime: Number.POSITIVE_INFINITY,
    retry: 1,
    // A background success after an error would lock municipio/estado while they are still empty.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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

function usePostalCode(zip: string) {
  return useQuery(postalCodeQueryOptions(zip));
}

export const POSTAL_CODE_LENGTH = 5;

type AddressField = "suburb" | "city" | "state";

interface AddressForm {
  /** Current postal code, read after the lookup resolves. */
  getPostalCode: () => string;
  set: (field: AddressField, value: string) => void;
}

/** Fills colonia, municipio and estado from a SEPOMEX postal code lookup. */
export function useAddressLookup(zip: string) {
  const queryClient = useQueryClient();
  const query = usePostalCode(zip);
  const settlements = query.data ?? [];
  const notFound = query.isSuccess && settlements.length === 0;

  let hint: string | null = null;

  if (query.isFetching) {
    hint = "Buscando código postal…";
  } else if (query.isError) {
    hint =
      "No se pudo consultar el código postal. Captura la dirección a mano.";
  } else if (notFound) {
    hint = "No encontramos ese código postal. Captura la dirección a mano.";
  }

  async function fill(value: string, form: AddressForm) {
    form.set("suburb", "");
    form.set("city", "");
    form.set("state", "");

    if (value.length !== POSTAL_CODE_LENGTH) {
      return;
    }

    let found: Settlement[];

    try {
      found = await queryClient.query(postalCodeQueryOptions(value));
    } catch {
      // `hint` shows the error under the field.
      return;
    }

    // The user kept typing while the request was in flight.
    if (form.getPostalCode() !== value) {
      return;
    }

    const [first] = found;

    if (!first) {
      return;
    }

    form.set("city", first.d_mnpio);
    form.set("state", first.d_estado);

    if (found.length === 1) {
      form.set("suburb", first.d_asenta);
    }
  }

  return {
    hint,
    // SEPOMEX owns municipio and estado; only a miss or an error unlocks them so the address can be typed by hand.
    regionLocked: !(query.isError || notFound),
    // Colonia only waits for the lookup; it stays open afterwards so a colonia SEPOMEX lacks can be typed.
    suburbLocked: !(query.isSuccess || query.isError),
    suburbOptions: [...new Set(settlements.map((s) => s.d_asenta))].map(
      (value) => ({ value, label: value })
    ),
    fill,
  };
}
