import { CUSTOMER_STATUSES } from "@suni/db/schema/customer-enums";
import { z } from "zod";

import { scopedProcedure } from "../../index";
import {
  ownCustomers,
  sellerColumns,
  sellerRelation,
  withSeller,
} from "../../util/scope";
import { statusWhere } from "../../util/status";

export const list = scopedProcedure
  .route({ method: "GET", path: "/" })
  .input(z.object({ status: z.enum(CUSTOMER_STATUSES).default("active") }))
  .handler(async ({ input, context }) => {
    const rows = await context.db.query.customer.findMany({
      where: {
        AND: [statusWhere("customer", input.status), ownCustomers(context)],
      },
      columns: sellerColumns(context),
      with: sellerRelation(context),
    });

    return rows.map((row) => withSeller(context, row));
  });
