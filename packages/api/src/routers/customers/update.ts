import { customer } from "@suni/db/schema/customers";
import { customerSchema } from "@suni/db/validation/customers";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { scopedProcedure } from "../../index";
import { ownCustomersSql } from "../../util/scope";

export const update = scopedProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(customerSchema.extend({ id: z.string() }))
  .handler(async ({ input, context, errors }) => {
    const { id, type, ...fields } = input;

    const { userId } = context;

    const data = context.admin ? { ...fields, type } : fields;

    const [updated] = await context.db
      .update(customer)
      .set({ ...data, modifiedBy: userId })
      // Archived customers are read-only until restored.
      .where(
        and(
          eq(customer.id, id),
          isNull(customer.archived),
          ownCustomersSql(context)
        )
      )
      .returning({ id: customer.id });

    if (!updated) {
      throw errors.NOT_FOUND({
        message: "El cliente no existe o está archivado",
      });
    }

    return updated;
  });
