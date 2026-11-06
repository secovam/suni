import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { isAdmin, protectedProcedure } from "../../index";

export const get = protectedProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    const admin = await isAdmin(context, userId);

    const found = await context.db.query.contact.findFirst({
      where: {
        id: input.id,
        branch: admin ? undefined : { sellerId: userId },
      },
      columns: admin ? undefined : { modifiedBy: false },
      with: {
        branch: { columns: { id: true, name: true } },
        customer: { columns: { id: true, name: true } },
      },
    });

    if (!found) {
      throw new ORPCError("NOT_FOUND", { message: "Contact not found" });
    }

    return found;
  });
