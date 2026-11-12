import type { CUSTOMER_STATUSES } from "@suni/db/schema/customer-enums";

import { stripAccents } from "@/lib/string-utils";

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
