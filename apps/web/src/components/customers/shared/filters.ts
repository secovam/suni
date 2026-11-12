import type { CUSTOMER_STATUSES } from "@suni/db/schema/customer-enums";

import { stripAccents } from "@/lib/string-utils";

import { archiveState } from "./archive-state";

export type StatusFilter = (typeof CUSTOMER_STATUSES)[number];

export interface BranchFilters {
  name: string;
  status: StatusFilter;
  customerId: string;
}

export const DEFAULT_BRANCH_FILTERS: BranchFilters = {
  name: "",
  status: "all",
  customerId: "all",
};

export interface ContactFilters {
  name: string;
  status: StatusFilter;
}

export const DEFAULT_CONTACT_FILTERS: ContactFilters = {
  name: "",
  status: "all",
};

/** Rows per status tab, using the same archive rule as the API. */
export function byStatus<T extends Parameters<typeof archiveState>[0]>(
  rows: readonly T[]
): Record<StatusFilter, T[]> {
  const archived = rows.filter((row) => archiveState(row).isArchived);
  const active = rows.filter((row) => !archiveState(row).isArchived);

  return { active, archived, all: [...rows] };
}

export function countByStatus(byStatusRows: Record<StatusFilter, unknown[]>) {
  return {
    active: byStatusRows.active.length,
    archived: byStatusRows.archived.length,
    all: byStatusRows.all.length,
  };
}

export function byName(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name, "es");
}

/** Accent- and case-insensitive name search, sorted by name. */
export function matchingName<R extends readonly { name: string }[]>(
  rows: R,
  name: string
): R[number][] {
  const term = stripAccents(name.trim()).toLowerCase();

  return rows
    .filter(
      (row) => !term || stripAccents(row.name).toLowerCase().includes(term)
    )
    .toSorted(byName);
}
