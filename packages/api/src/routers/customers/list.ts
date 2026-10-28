import { CUSTOMER_STATUSES } from "@suni/db/schema/customer-enums";
import { z } from "zod";

import { isAdmin, protectedProcedure } from "../../index";

const statusFilters = {
  active: { archived: { isNull: true } },
  archived: { archived: { isNotNull: true } },
} as const;

export const list = protectedProcedure
  .route({ method: "GET", path: "/" })
  .input(z.object({ status: z.enum(CUSTOMER_STATUSES).default("active") }))
  .handler(async ({ input, context }) => {
    const where =
      input.status === "all" ? undefined : statusFilters[input.status];

    if (await isAdmin(context, context.session.user.id)) {
      return context.db.query.customer.findMany({
        where,
        with: { seller: { columns: { id: true, name: true } } },
      });
    }

    // Seller identity is admin-only.
    const rows = await context.db.query.customer.findMany({
      where,
      columns: { sellerId: false, modifiedBy: false },
    });

    return rows.map((row) => ({ ...row, seller: null }));
  });
