import { ORPCError } from "@orpc/server";
import { customer } from "@suni/db/schema/customers";
import { updateCustomerSchema } from "@suni/db/validation/customers";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { scopedProcedure } from "../../index";

export const update = scopedProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(updateCustomerSchema.extend({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const { id, type, ...fields } = input;

    const { userId } = context;

    const data = context.admin ? { ...fields, type } : fields;

    if (Object.values(data).every((v) => v === undefined)) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No hay campos para actualizar",
      });
    }

    const [updated] = await context.db
      .update(customer)
      .set({ ...data, modifiedBy: userId })
      // Archived customers are read-only until restored.
      .where(and(eq(customer.id, id), isNull(customer.archived)))
      .returning({ id: customer.id });

    if (!updated) {
      throw new ORPCError("NOT_FOUND", {
        message: "El cliente no existe o está archivado",
      });
    }

    return updated;
  });
