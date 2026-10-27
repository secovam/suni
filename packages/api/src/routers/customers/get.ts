import { ORPCError } from "@orpc/server";
import { user } from "@suni/db/schema/auth";
import { customer } from "@suni/db/schema/customers";
import { eq, getTableColumns } from "drizzle-orm";
import { z } from "zod";

import { isAdmin, protectedProcedure } from "../../index";

export const get = protectedProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const [found] = await context.db
      .select({
        ...getTableColumns(customer),
        seller: { id: user.id, name: user.name },
      })
      .from(customer)
      .innerJoin(user, eq(user.id, customer.sellerId))
      .where(eq(customer.id, input.id))
      .limit(1);

    if (!found) {
      throw new ORPCError("NOT_FOUND", { message: "Customer not found" });
    }

    // Seller names are admin-only.
    if (await isAdmin(context, context.session.user.id)) {
      return found;
    }

    return { ...found, seller: null };
  });
