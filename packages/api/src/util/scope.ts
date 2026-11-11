import { branch } from "@suni/db/schema/branches";
import { contact } from "@suni/db/schema/contacts";
import { customer } from "@suni/db/schema/customers";
import { eq, inArray } from "drizzle-orm";

import type { Context } from "../context";

interface Scope extends Pick<Context, "db"> {
  admin: boolean;
  userId: string;
}

// Non-admins only reach the customers and branches they sell and the contacts under them.
// Each rule has a relational-query form and a SQL form for update/delete builders.

export function ownCustomers({ admin, userId }: Scope) {
  return admin ? {} : { sellerId: userId };
}

export function ownCustomersSql({ admin, userId }: Scope) {
  return admin ? undefined : eq(customer.sellerId, userId);
}

export function ownBranches({ admin, userId }: Scope) {
  return admin ? {} : { sellerId: userId };
}

export function ownBranchesSql({ admin, userId }: Scope) {
  return admin ? undefined : eq(branch.sellerId, userId);
}

export function ownContacts(scope: Scope) {
  return scope.admin ? {} : { branch: ownBranches(scope) };
}

export function ownContactsSql({ admin, userId, db }: Scope) {
  return admin
    ? undefined
    : inArray(
        contact.branchId,
        db
          .select({ id: branch.id })
          .from(branch)
          .where(eq(branch.sellerId, userId))
      );
}

// Seller identity is admin-only. Spread `sellerColumns` and `sellerRelation`
// into a customer or branch query, then pass the result through `withSeller`.

export function sellerColumns({ admin }: Pick<Scope, "admin">) {
  return admin ? undefined : ({ sellerId: false, modifiedBy: false } as const);
}

export function sellerRelation({ admin }: Pick<Scope, "admin">) {
  return admin
    ? ({ seller: { columns: { id: true, name: true } } } as const)
    : {};
}

export function withSeller<T extends { seller?: unknown }>(
  { admin }: Pick<Scope, "admin">,
  row: T
) {
  return admin ? row : { ...row, seller: null };
}
