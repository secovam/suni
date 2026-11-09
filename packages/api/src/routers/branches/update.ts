import { ORPCError } from "@orpc/server";
import { branch } from "@suni/db/schema/branches";
import { updateBranchSchema } from "@suni/db/validation/branches";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { scopedProcedure } from "../../index";
import { ownBranchesSql } from "../../util/scope";

export const update = scopedProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(updateBranchSchema.omit({ archived: true }).extend({ id: z.string() }))
  .handler(async ({ input, context, errors }) => {
    const { id, ...fields } = input;

    const { userId } = context;

    if (Object.values(fields).every((v) => v === undefined)) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No hay campos para actualizar",
      });
    }

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
