import { ORPCError } from "@orpc/server";
import { branch } from "@suni/db/schema/branches";
import { updateBranchSchema } from "@suni/db/validation/branches";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { isAdmin, protectedProcedure } from "../../index";

export const update = protectedProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(updateBranchSchema.omit({ archived: true }).extend({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const { id, ...fields } = input;

    const userId = context.session.user.id;

    if (Object.values(fields).every((v) => v === undefined)) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No hay campos para actualizar",
      });
    }

    const admin = await isAdmin(context, userId);

    const [updated] = await context.db
      .update(branch)
      .set({ ...fields, modifiedBy: userId })
      .where(
        and(
          eq(branch.id, id),
          isNull(branch.archived),
          admin ? undefined : eq(branch.sellerId, userId)
        )
      )
      .returning({ id: branch.id });

    if (!updated) {
      throw new ORPCError("NOT_FOUND", {
        message: "La sucursal no existe o está archivada",
      });
    }

    return updated;
  });
