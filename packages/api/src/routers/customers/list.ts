import { user } from "@suni/db/schema/auth";
import { CUSTOMER_STATUSES } from "@suni/db/schema/customer-enums";
import { customer } from "@suni/db/schema/customers";
import { eq, getColumns, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";

import { isAdmin, protectedProcedure } from "../../index";

const statusFilters = {
  active: isNull(customer.archived),
  archived: isNotNull(customer.archived),
};

export const list = protectedProcedure
  .route({ method: "GET", path: "/" })
  .input(z.object({ status: z.enum(CUSTOMER_STATUSES).default("active") }))
  .handler(async ({ input, context }) => {
    const rows = await context.db
      .select({
        ...getColumns(customer),
        seller: { id: user.id, name: user.name },
      })
      .from(customer)
      .innerJoin(user, eq(user.id, customer.sellerId))
      .where(input.status === "all" ? undefined : statusFilters[input.status]);

    // Seller names are admin-only.
    if (await isAdmin(context, context.session.user.id)) {
      return rows;
    }

    return rows.map((row) => ({ ...row, seller: null }));
  });
