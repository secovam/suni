import { ORPCError } from "@orpc/server";
import { customer } from "@suni/db/schema/customers";
import { eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-orm/zod";
import { z } from "zod";

import { adminProcedure } from "../../index";

export const update = adminProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(
    createUpdateSchema(customer)
      .omit({
        id: true,
        sellerId: true,
        modifiedBy: true,
        createdAt: true,
        updatedAt: true,
        archived: true,
      })
      .extend({ id: z.string() })
  )
  .handler(async ({ input, context }) => {
    const { id, ...data } = input;

    const [updated] = await context.db
      .update(customer)
      .set({ ...data, modifiedBy: context.session.user.id })
      .where(eq(customer.id, id))
      .returning();

    if (!updated) {
      throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
    }

    return updated;
  });
