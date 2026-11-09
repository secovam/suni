import { branch } from "@suni/db/schema/branches";
import { contact } from "@suni/db/schema/contacts";
import { eq, inArray } from "drizzle-orm";

import type { Context } from "../context";

interface Scope extends Pick<Context, "db"> {
  admin: boolean;
  userId: string;
}

// Non-admins only reach the branches they sell and the contacts under them.
// Each rule has a relational-query form and a SQL form for update/delete builders.

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
