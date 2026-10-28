import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { isAdmin, protectedProcedure } from "../../index";

function notFound() {
  return new ORPCError("NOT_FOUND", { message: "Customer not found" });
}

export const get = protectedProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const where = { id: input.id };

    if (await isAdmin(context, context.session.user.id)) {
      const found = await context.db.query.customer.findFirst({
        where,
        with: { seller: { columns: { id: true, name: true } } },
      });

      if (!found) {
        throw notFound();
      }

      return found;
    }

    // Seller identity is admin-only.
    const found = await context.db.query.customer.findFirst({
      where,
      columns: { sellerId: false, modifiedBy: false },
    });

    if (!found) {
      throw notFound();
    }

    return { ...found, seller: null };
  });
