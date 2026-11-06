import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { isAdmin, protectedProcedure } from "../../index";

function notFound() {
  return new ORPCError("NOT_FOUND", { message: "Branch not found" });
}

export const get = protectedProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const admin = await isAdmin(context, context.session.user.id);

    const found = await context.db.query.branch.findFirst({
      where: admin
        ? { id: input.id }
        : { id: input.id, sellerId: context.session.user.id },
      columns: admin ? undefined : { sellerId: false, modifiedBy: false },
      with: {
        customer: { columns: { id: true, name: true } },
        contacts: true,
        ...(admin && { seller: { columns: { id: true, name: true } } }),
      },
    });

    if (!found) {
      throw notFound();
    }

    return admin ? found : { ...found, seller: null };
  });
