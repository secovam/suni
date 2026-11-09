import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { scopedProcedure } from "../../index";

export const get = scopedProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const { userId, admin } = context;

    const found = await context.db.query.contact.findFirst({
      where: {
        id: input.id,
        branch: admin ? undefined : { sellerId: userId },
      },
      columns: admin ? undefined : { modifiedBy: false },
      with: {
        branch: { columns: { id: true, name: true, archived: true } },
        customer: { columns: { id: true, name: true, archived: true } },
      },
    });

    if (!found) {
      throw new ORPCError("NOT_FOUND", { message: "Contact not found" });
    }

    return found;
  });
