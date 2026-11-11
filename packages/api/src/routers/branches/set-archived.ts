import { branch } from "@suni/db/schema/branches";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { scopedProcedure } from "../../index";
import { ownBranchesSql } from "../../util/scope";
import { activeCustomerIdsSql } from "../../util/status";

export const setArchived = scopedProcedure
  .route({ method: "POST", path: "/{id}/archived" })
  .input(z.object({ id: z.string(), archived: z.boolean() }))
  .handler(async ({ input, context, errors }) => {
    const { userId } = context;

    const [updated] = await context.db
      .update(branch)
      .set({
        archived: input.archived
          ? sql`COALESCE(${branch.archived}, now())`
          : null,
        modifiedBy: userId,
      })
      // An archived customer wins: the branch status cannot change under it.
      .where(
        and(
          eq(branch.id, input.id),
          inArray(branch.customerId, activeCustomerIdsSql(context.db)),
          ownBranchesSql(context)
        )
      )
      .returning({ id: branch.id });

    if (!updated) {
      throw errors.NOT_FOUND({
        message: "La sucursal no existe o su cliente está archivado",
      });
    }

    return updated;
  });
