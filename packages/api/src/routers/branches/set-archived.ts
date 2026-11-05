import { ORPCError } from "@orpc/server";
import { branch } from "@suni/db/schema/branches";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { isAdmin, protectedProcedure } from "../../index";

export const setArchived = protectedProcedure
  .route({ method: "POST", path: "/{id}/archived" })
  .input(z.object({ id: z.string(), archived: z.boolean() }))
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    const admin = await isAdmin(context, userId);

    const [updated] = await context.db
      .update(branch)
      .set({
        archived: input.archived
          ? sql`COALESCE(${branch.archived}, now())`
          : null,
        modifiedBy: userId,
      })
      .where(
        admin
          ? eq(branch.id, input.id)
          : and(eq(branch.id, input.id), eq(branch.sellerId, userId))
      )
      .returning({ id: branch.id });

    if (!updated) {
      throw new ORPCError("NOT_FOUND", { message: "Branch not found" });
    }

    return updated;
  });
