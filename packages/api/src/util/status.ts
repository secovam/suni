import { branch } from "@suni/db/schema/branches";
import { customer } from "@suni/db/schema/customers";
import { and, eq, isNull as isNullSql, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import type { Context } from "../context";

const isNull = { isNull: true } as const;

const isNotNull = { isNotNull: true } as const;

const visible = {
  customer: { archived: isNull },
  branch: { archived: isNull, customer: { archived: isNull } },
  contact: {
    archived: isNull,
    branch: { archived: isNull },
    customer: { archived: isNull },
  },
} as const;

const archived = {
  customer: { archived: isNotNull },
  branch: {
    OR: [{ archived: isNotNull }, { customer: { archived: isNotNull } }],
  },
  contact: {
    OR: [
      { archived: isNotNull },
      { branch: { archived: isNotNull } },
      { customer: { archived: isNotNull } },
    ],
  },
} as const;

type Entity = keyof typeof visible;

type Status = "active" | "archived" | "all";

export function statusWhere(entity: Entity, status: Status) {
  if (status === "all") {
    return {};
  }

  if (status === "active") {
    return visible[entity];
  }

  return archived[entity];
}

// SQL forms for update builders, which cannot filter through relations.

export function activeCustomerIdsSql(db: Context["db"]) {
  return db
    .select({ id: customer.id })
    .from(customer)
    .where(isNullSql(customer.archived));
}

export function activeBranchIdsSql(db: Context["db"]) {
  return db
    .select({ id: branch.id })
    .from(branch)
    .innerJoin(customer, eq(branch.customerId, customer.id))
    .where(and(isNullSql(branch.archived), isNullSql(customer.archived)));
}

// Set the target state instead of toggling, so a repeated request is a no-op.
// COALESCE keeps the original archive date when it is already archived.
export function archivedValue(column: AnyPgColumn, isArchived: boolean) {
  return isArchived ? sql`COALESCE(${column}, now())` : null;
}
