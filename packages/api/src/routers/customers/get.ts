import { ORPCError } from "@orpc/server";
import { customer } from "@suni/db/schema/customers";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../../index";

export const get = adminProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const [found] = await context.db
      .select()
      .from(customer)
      .where(eq(customer.id, input.id))
      .limit(1);

    if (!found) {
      throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
    }

    return found;
  });
