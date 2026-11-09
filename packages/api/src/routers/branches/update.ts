import { branch } from "@suni/db/schema/branches";
import { branchSchema } from "@suni/db/validation/branches";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { scopedProcedure } from "../../index";
import { ownBranchesSql } from "../../util/scope";

export const update = scopedProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(branchSchema.extend({ id: z.string() }))
  .handler(async ({ input, context, errors }) => {
    const { id, ...fields } = input;

    const { userId } = context;

    const [updated] = await context.db
      .update(branch)
      .set({ ...fields, modifiedBy: userId })
      .where(
        and(eq(branch.id, id), isNull(branch.archived), ownBranchesSql(context))
      )
      .returning({ id: branch.id });

    if (!updated) {
      throw errors.NOT_FOUND({
        message: "La sucursal no existe o está archivada",
      });
    }

    return updated;
  });
