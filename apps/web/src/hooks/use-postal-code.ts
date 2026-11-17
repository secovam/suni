import { useActorRef, useSelector } from "@xstate/react";
import { useEffect, useEffectEvent } from "react";
import { createAsyncLogic } from "xstate";
import type { SnapshotFrom } from "xstate";
import { z } from "zod";

import { ENV } from "@/env";
import { queryClient } from "@/utils/orpc";

import {
  addressLookupMachine,
  settlementSchema,
} from "./address-lookup-machine";
import type { Settlement } from "./address-lookup-machine";

const responseSchema = z.object({
  zip_codes: z.array(settlementSchema),
});

// The query cache keeps a looked-up postal code for the session, so reopening a form does not refetch it.
const lookup = createAsyncLogic<Settlement[], { zip: string }>({
  run: ({ input: { zip } }) =>
    queryClient.fetchQuery({
      queryKey: ["postal-code", zip],
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
    }),
});

const machine = addressLookupMachine.provide({ actors: { lookup } });

export const POSTAL_CODE_LENGTH = 5;

type AddressField = "suburb" | "city" | "state";

type LookupState = SnapshotFrom<typeof machine>["value"];

// SEPOMEX owns municipio and estado; only a miss or an error unlocks them so the address can be typed by hand.
// Colonia only waits for the lookup; it stays open afterwards so a colonia SEPOMEX lacks can be typed.
const VIEW = {
  start: { hint: null, regionLocked: true, suburbLocked: true },
  incomplete: { hint: null, regionLocked: true, suburbLocked: true },
  lookingUp: {
    hint: "Buscando código postal…",
    regionLocked: true,
    suburbLocked: true,
  },
  found: { hint: null, regionLocked: true, suburbLocked: false },
  notFound: {
    hint: "No encontramos ese código postal. Captura la dirección a mano.",
    regionLocked: false,
    suburbLocked: false,
  },
  failed: {
    hint: "No se pudo consultar el código postal. Captura la dirección a mano.",
    regionLocked: false,
    suburbLocked: false,
  },
} satisfies Record<
  LookupState,
  { hint: string | null; regionLocked: boolean; suburbLocked: boolean }
>;

/** Fills colonia, municipio and estado from a SEPOMEX postal code lookup. */
export function useAddressLookup(
  initialZip: string,
  set: (field: AddressField, value: string) => void
) {
  const actor = useActorRef(machine, { input: { zip: initialZip } });
  const state = useSelector(actor, (s) => s.value);
  const settlements = useSelector(actor, (s) => s.context.settlements);

  const onSet = useEffectEvent(
    (address: { suburb: string; city: string; state: string }) => {
      set("suburb", address.suburb);
      set("city", address.city);
      set("state", address.state);
    }
  );

  useEffect(() => {
    const subscription = actor.on("address.set", onSet);

    return () => subscription.unsubscribe();
  }, [actor]);

  return {
    ...VIEW[state],
    suburbOptions: [...new Set(settlements.map((s) => s.d_asenta))].map(
      (value) => ({ value, label: value })
    ),
    changePostalCode: (zip: string) => actor.send({ type: "zip.changed", zip }),
  };
}
