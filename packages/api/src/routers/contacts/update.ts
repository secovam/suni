import { contact } from "@suni/db/schema/contacts";
import { contactSchema } from "@suni/db/validation/contacts";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";

import { scopedProcedure } from "../../index";
import { ownContactsSql } from "../../util/scope";
import { activeBranchIdsSql } from "../../util/status";

export const update = scopedProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(contactSchema.extend({ id: z.string() }))
  .handler(async ({ input, context, errors }) => {
    const { id, ...fields } = input;
    const { userId } = context;

    const [updated] = await context.db
      .update(contact)
      .set({ ...fields, modifiedBy: userId })
      .where(
        and(
          eq(contact.id, id),
          isNull(contact.archived),
          inArray(contact.branchId, activeBranchIdsSql(context.db)),
          ownContactsSql(context)
        )
      )
      .returning({ id: contact.id });

    if (!updated) {
      throw errors.NOT_FOUND({
        message:
          "El contacto no existe, o él, su sucursal o su cliente están archivados",
      });
    }

    return updated;
  });
