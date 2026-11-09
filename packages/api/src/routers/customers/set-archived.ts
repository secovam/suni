import { customer } from "@suni/db/schema/customers";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { scopedProcedure } from "../../index";
import { ownCustomersSql } from "../../util/scope";

export const setArchived = scopedProcedure
  .route({ method: "POST", path: "/{id}/archived" })
  .input(z.object({ id: z.string(), archived: z.boolean() }))
  .handler(async ({ input, context, errors }) => {
    // Set the target state instead of toggling, so a repeated request is a no-op.
    // COALESCE keeps the original archive date when it is already archived.
    const [updated] = await context.db
      .update(customer)
      .set({
        archived: input.archived
          ? sql`COALESCE(${customer.archived}, now())`
          : null,
        modifiedBy: context.userId,
      })
      .where(and(eq(customer.id, input.id), ownCustomersSql(context)))
      .returning({ id: customer.id });

    if (!updated) {
      throw errors.NOT_FOUND({ message: "El cliente no existe" });
    }

    return updated;
  });
