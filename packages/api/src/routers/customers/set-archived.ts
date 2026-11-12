import { customer } from "@suni/db/schema/customers";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { scopedProcedure } from "../../index";
import { ownCustomersSql } from "../../util/scope";
import { archivedValue } from "../../util/status";

export const setArchived = scopedProcedure
  .route({ method: "POST", path: "/{id}/archived" })
  .input(z.object({ id: z.string(), archived: z.boolean() }))
  .handler(async ({ input, context, errors }) => {
    const [updated] = await context.db
      .update(customer)
      .set({
        archived: archivedValue(customer.archived, input.archived),
        modifiedBy: context.userId,
      })
      .where(and(eq(customer.id, input.id), ownCustomersSql(context)))
      .returning({ id: customer.id });

    if (!updated) {
      throw errors.NOT_FOUND({ message: "El cliente no existe" });
    }

    return updated;
  });
