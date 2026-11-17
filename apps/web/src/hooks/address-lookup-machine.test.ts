/// <reference types="bun" />
import { describe, expect, test } from "bun:test";

import { createActor, createAsyncLogic, waitFor } from "xstate";

import { addressLookupMachine } from "./address-lookup-machine";
import type { Settlement } from "./address-lookup-machine";

function settlement(zip: string, suburb: string): Settlement {
  return {
    d_codigo: zip,
    d_asenta: suburb,
    d_tipo_asenta: "Colonia",
    d_mnpio: "Álvaro Obregón",
    d_estado: "Ciudad de México",
  };
}

// One pending request per zip, settled by the test, so ordering is explicit.
function fakeLookup() {
  const pending = new Map<
    string,
    PromiseWithResolvers<Settlement[]> & { signal: AbortSignal }
  >();

  const logic = createAsyncLogic<Settlement[], { zip: string }>({
    run: ({ input, signal }) => {
      const request = Promise.withResolvers<Settlement[]>();
      pending.set(input.zip, { ...request, signal });

      return request.promise;
    },
  });

  return { logic, pending };
}

function start(zip = "") {
  const lookup = fakeLookup();

  const actor = createActor(
    addressLookupMachine.provide({ actors: { lookup: lookup.logic } }),
    { input: { zip } }
  );

  const filled: { suburb: string; city: string; state: string }[] = [];

  actor.on("address.set", ({ suburb, city, state }) =>
    filled.push({ suburb, city, state })
  );
  actor.start();

  return { actor, filled, pending: lookup.pending };
}

const settled = { timeout: 1000 };

const EMPTY = { suburb: "", city: "", state: "" };

describe("address lookup", () => {
  test("a new form waits for five digits without looking anything up", () => {
    const { actor, pending } = start();
    actor.send({ type: "zip.changed", zip: "0100" });

    expect(actor.getSnapshot().value).toBe("incomplete");
    expect(pending.size).toBe(0);
  });

  test("editing a saved address looks it up for options but never overwrites it", async () => {
    const { actor, filled, pending } = start("01000");
    expect(actor.getSnapshot().value).toBe("lookingUp");

    pending.get("01000")?.resolve([settlement("01000", "San Ángel")]);
    await waitFor(actor, (s) => s.matches("found"), settled);

    expect(filled).toEqual([]);
    expect(actor.getSnapshot().context.settlements).toHaveLength(1);
  });

  test("one settlement fills colonia, municipio and estado", async () => {
    const { actor, filled, pending } = start();
    actor.send({ type: "zip.changed", zip: "01000" });

    pending.get("01000")?.resolve([settlement("01000", "San Ángel")]);
    await waitFor(actor, (s) => s.matches("found"), settled);

    expect(filled).toEqual([
      EMPTY,
      {
        suburb: "San Ángel",
        city: "Álvaro Obregón",
        state: "Ciudad de México",
      },
    ]);
  });

  test("several settlements fill municipio and estado and leave colonia to the user", async () => {
    const { actor, filled, pending } = start();
    actor.send({ type: "zip.changed", zip: "01000" });

    pending
      .get("01000")
      ?.resolve([
        settlement("01000", "San Ángel"),
        settlement("01000", "Tizapán"),
      ]);
    await waitFor(actor, (s) => s.matches("found"), settled);

    expect(filled.at(-1)).toEqual({
      suburb: "",
      city: "Álvaro Obregón",
      state: "Ciudad de México",
    });
  });

  test("an unknown postal code unlocks the address without filling it", async () => {
    const { actor, filled, pending } = start();
    actor.send({ type: "zip.changed", zip: "99999" });

    pending.get("99999")?.resolve([]);
    await waitFor(actor, (s) => s.matches("notFound"), settled);

    expect(filled).toEqual([EMPTY]);
  });

  test("a failed lookup unlocks the address without filling it", async () => {
    const { actor, filled, pending } = start();
    actor.send({ type: "zip.changed", zip: "01000" });

    pending.get("01000")?.reject(new Error("SEPOMEX is down"));
    await waitFor(actor, (s) => s.matches("failed"), settled);

    expect(filled).toEqual([EMPTY]);
  });

  test("a slow answer for an old postal code never lands after the user typed a new one", async () => {
    const { actor, filled, pending } = start();
    actor.send({ type: "zip.changed", zip: "01000" });
    actor.send({ type: "zip.changed", zip: "0100" });
    actor.send({ type: "zip.changed", zip: "01090" });

    expect(pending.get("01000")?.signal.aborted).toBe(true);

    pending.get("01000")?.resolve([settlement("01000", "San Ángel")]);
    pending.get("01090")?.resolve([settlement("01090", "Tlacopac")]);
    await waitFor(actor, (s) => s.matches("found"), settled);

    expect(filled.at(-1)?.suburb).toBe("Tlacopac");
    expect(filled.some((f) => f.suburb === "San Ángel")).toBe(false);
  });

  test("shortening the postal code clears the filled address", async () => {
    const { actor, filled, pending } = start();
    actor.send({ type: "zip.changed", zip: "01000" });
    pending.get("01000")?.resolve([settlement("01000", "San Ángel")]);
    await waitFor(actor, (s) => s.matches("found"), settled);

    actor.send({ type: "zip.changed", zip: "0100" });

    expect(actor.getSnapshot().value).toBe("incomplete");
    expect(filled.at(-1)).toEqual(EMPTY);
    expect(actor.getSnapshot().context.settlements).toEqual([]);
  });

  test("closing the form mid-lookup aborts the request and writes nothing", async () => {
    const { actor, filled, pending } = start();
    actor.send({ type: "zip.changed", zip: "01000" });
    actor.stop();

    expect(pending.get("01000")?.signal.aborted).toBe(true);

    pending.get("01000")?.resolve([settlement("01000", "San Ángel")]);
    await Promise.resolve();

    expect(filled).toEqual([EMPTY]);
  });
});
