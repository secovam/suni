import type { CUSTOMER_STATUSES } from "@suni/db/schema/customer-enums";

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
