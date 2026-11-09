import { CUSTOMER_STATUSES } from "@suni/db/schema/customer-enums";
import { z } from "zod";

import { scopedProcedure } from "../../index";
import { statusWhere } from "../../util/status";

export const list = scopedProcedure
  .route({ method: "GET", path: "/" })
  .input(
    z.object({
      customerId: z.string().optional(),
      status: z.enum(CUSTOMER_STATUSES).default("active"),
    })
  )
  .handler(async ({ input, context }) => {
    const { userId } = context;

    const where = {
      AND: [
        statusWhere("branch", input.status),
        ...(input.customerId ? [{ customerId: input.customerId }] : []),
      ],
    };

    if (context.admin) {
      return context.db.query.branch.findMany({
        where,
        with: {
          customer: { columns: { id: true, name: true, archived: true } },
          seller: { columns: { id: true, name: true } },
          contacts: true,
        },
      });
    }

    // Seller identity is admin-only.
    const rows = await context.db.query.branch.findMany({
      where: { AND: [where, { sellerId: userId }] },
      columns: { sellerId: false, modifiedBy: false },
      with: {
        customer: { columns: { id: true, name: true, archived: true } },
        contacts: true,
      },
    });

    return rows.map((row) => ({ ...row, seller: null }));
  });
