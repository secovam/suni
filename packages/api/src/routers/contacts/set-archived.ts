import { contact } from "@suni/db/schema/contacts";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { scopedProcedure } from "../../index";
import { ownContactsSql } from "../../util/scope";
import { activeBranchIdsSql } from "../../util/status";

export const setArchived = scopedProcedure
  .route({ method: "POST", path: "/{id}/archived" })
  .input(z.object({ id: z.string(), archived: z.boolean() }))
  .handler(async ({ input, context, errors }) => {
    const { userId } = context;

    const [updated] = await context.db
      .update(contact)
      .set({
        archived: input.archived
          ? sql`COALESCE(${contact.archived}, now())`
          : null,
        modifiedBy: userId,
      })
      // An archived branch or customer wins: the contact status cannot change under it.
      .where(
        and(
          eq(contact.id, input.id),
          inArray(contact.branchId, activeBranchIdsSql(context.db)),
          ownContactsSql(context)
        )
      )
      .returning({ id: contact.id });

    if (!updated) {
      throw errors.NOT_FOUND({
        message:
          "El contacto no existe o su sucursal o cliente están archivados",
      });
    }

    return updated;
  });
