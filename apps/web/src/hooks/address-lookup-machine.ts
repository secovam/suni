import { createAsyncLogic, setup, types } from "xstate";
import { z } from "zod";

export const settlementSchema = z.object({
  d_codigo: z.string(),
  d_asenta: z.string(),
  d_tipo_asenta: z.string(),
  d_mnpio: z.string(),
  d_estado: z.string(),
});

export type Settlement = z.infer<typeof settlementSchema>;

const EMPTY = { suburb: "", city: "", state: "" };

function isComplete(zip: string) {
  return /^\d{5}$/u.test(zip);
}

const addressLookupSetup = setup({
  schemas: {
    input: types<{ zip: string }>(),
    context: types<{
      zip: string;
      // False for the lookup that only loads options for a saved address.
      fill: boolean;
      settlements: Settlement[];
    }>(),
    events: { "zip.changed": types<{ zip: string }>() },
    emitted: {
      "address.set": types<{ suburb: string; city: string; state: string }>(),
    },
  },
  actors: {
    // The hook provides the SEPOMEX request; tests provide fakes.
    lookup: createAsyncLogic<Settlement[], { zip: string }>({
      run: () => Promise.reject(new Error("lookup is provided by the caller")),
    }),
  },
});

/** SEPOMEX autofill for colonia, municipio and estado, driven by the postal code field. */
export const addressLookupMachine = addressLookupSetup.createMachine({
  id: "addressLookup",
  context: ({ input }) => ({ zip: input.zip, fill: false, settlements: [] }),
  initial: "start",
  on: {
    "zip.changed": ({ event }, enq) => {
      enq.emit({ type: "address.set", ...EMPTY });

      const next = { zip: event.zip, fill: true, settlements: [] };

      if (!isComplete(event.zip)) {
        return { target: ".incomplete", context: next };
      }

      return {
        target: ".lookingUp",
        reenter: true,
        context: next,
      };
    },
  },
  states: {
    start: {
      type: "choice",
      choice: ({ context }) =>
        isComplete(context.zip)
          ? { target: "lookingUp" }
          : { target: "incomplete" },
    },
    incomplete: {},
    lookingUp: {
      invoke: {
        src: "lookup",
        input: ({ context }) => ({ zip: context.zip }),
        onDone: ({ context, event }, enq) => {
          const settlements = event.output;
          const [first] = settlements;

          if (!first) {
            return { target: "notFound" };
          }

          if (context.fill) {
            enq.emit({
              type: "address.set",
              suburb: settlements.length === 1 ? first.d_asenta : "",
              city: first.d_mnpio,
              state: first.d_estado,
            });
          }

          return { target: "found", context: { ...context, settlements } };
        },
        onError: { target: "failed" },
      },
    },
    found: {},
    notFound: {},
    failed: {},
  },
});
