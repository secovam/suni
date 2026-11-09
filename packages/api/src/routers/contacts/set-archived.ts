import { ORPCError } from "@orpc/server";
import { branch } from "@suni/db/schema/branches";
import { contact } from "@suni/db/schema/contacts";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { scopedProcedure } from "../../index";

export const setArchived = scopedProcedure
  .route({ method: "POST", path: "/{id}/archived" })
  .input(z.object({ id: z.string(), archived: z.boolean() }))
  .handler(async ({ input, context }) => {
    const { userId, admin } = context;

    const [updated] = await context.db
      .update(contact)
      .set({
        archived: input.archived
          ? sql`COALESCE(${contact.archived}, now())`
          : null,
        modifiedBy: userId,
      })
      .where(
        and(
          eq(contact.id, input.id),
          admin
            ? undefined
            : inArray(
                contact.branchId,
                context.db
                  .select({ id: branch.id })
                  .from(branch)
                  .where(eq(branch.sellerId, userId))
              )
        )
      )
      .returning({ id: contact.id });

    if (!updated) {
      throw new ORPCError("NOT_FOUND", { message: "Contact not found" });
    }

    return updated;
  });
