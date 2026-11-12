import { CUSTOMER_STATUSES } from "@suni/db/schema/customer-enums";
import { z } from "zod";

import { scopedProcedure } from "../../index";
import {
  ownBranches,
  sellerColumns,
  sellerRelation,
  withSeller,
} from "../../util/scope";
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
    const rows = await context.db.query.branch.findMany({
      where: {
        AND: [
          statusWhere("branch", input.status),
          ownBranches(context),
          { customerId: input.customerId },
        ],
      },
      columns: sellerColumns(context),
      with: {
        customer: { columns: { id: true, name: true, archived: true } },
        ...sellerRelation(context),
      },
    });

    return rows.map((row) => withSeller(context, row));
  });
