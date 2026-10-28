import { ORPCError } from "@orpc/server";
import { customer } from "@suni/db/schema/customers";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../../index";

export const archive = protectedProcedure
  .route({ method: "POST", path: "/{id}/archive" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    // Flip inside the UPDATE so concurrent toggles cannot read the same value.
    const [updated] = await context.db
      .update(customer)
      .set({
        archived: sql`CASE WHEN ${customer.archived} IS NULL THEN now() ELSE NULL END`,
        modifiedBy: context.session.user.id,
      })
      .where(eq(customer.id, input.id))
      .returning({ id: customer.id });

    if (!updated) {
      throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
    }

    return updated;
  });
