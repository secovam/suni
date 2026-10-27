import { ORPCError } from "@orpc/server";
import { customer } from "@suni/db/schema/customers";
import { customerInputSchema } from "@suni/db/validation/customers";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { isAdmin, protectedProcedure } from "../../index";

export const update = protectedProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(customerInputSchema.partial().extend({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const { id, type, ...fields } = input;

    const userId = context.session.user.id;

    const data = (await isAdmin(context, userId))
      ? { ...fields, type }
      : fields;

    if (Object.values(data).every((v) => v === undefined)) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No hay campos para actualizar",
      });
    }

    const [updated] = await context.db
      .update(customer)
      .set({ ...data, modifiedBy: userId })
      .where(eq(customer.id, id))
      .returning();

    if (!updated) {
      throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
    }

    return updated;
  });
