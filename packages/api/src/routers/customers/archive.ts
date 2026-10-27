import { ORPCError } from "@orpc/server";
import { customer } from "@suni/db/schema/customers";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../../index";

export const archive = protectedProcedure
  .route({ method: "POST", path: "/{id}/archive" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const [existing] = await context.db
      .select({ archived: customer.archived })
      .from(customer)
      .where(eq(customer.id, input.id))
      .limit(1);

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
    }

    const [updated] = await context.db
      .update(customer)
      .set({
        archived: existing.archived ? null : new Date(),
        modifiedBy: context.session.user.id,
      })
      .where(eq(customer.id, input.id))
      .returning();

    return updated;
  });
