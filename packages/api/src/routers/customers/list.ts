import { user } from "@suni/db/schema/auth";
import { customer } from "@suni/db/schema/customers";
import { asc, eq, getTableColumns, isNull } from "drizzle-orm";
import { z } from "zod";

import { isAdmin, protectedProcedure } from "../../index";

export const list = protectedProcedure
  .route({ method: "GET", path: "/" })
  .input(z.object({ includeArchived: z.boolean().default(false) }))
  .handler(async ({ input, context }) => {
    const rows = await context.db
      .select({
        ...getTableColumns(customer),
        seller: { id: user.id, name: user.name },
      })
      .from(customer)
      .innerJoin(user, eq(user.id, customer.sellerId))
      .where(input.includeArchived ? undefined : isNull(customer.archived))
      .orderBy(asc(customer.name));

    // Seller names are admin-only.
    if (await isAdmin(context, context.session.user.id)) {
      return rows;
    }

    return rows.map((row) => ({ ...row, seller: null }));
  });
