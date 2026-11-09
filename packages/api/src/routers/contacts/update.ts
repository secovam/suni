import { ORPCError } from "@orpc/server";
import { contact } from "@suni/db/schema/contacts";
import { updateContactSchema } from "@suni/db/validation/contacts";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { scopedProcedure } from "../../index";
import { ownContactsSql } from "../../util/scope";

export const update = scopedProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(
    updateContactSchema
      .omit({ archived: true, customerId: true })
      .extend({ id: z.string() })
  )
  .handler(async ({ input, context }) => {
    const { id, ...fields } = input;
    const { userId } = context;

    if (Object.values(fields).every((v) => v === undefined)) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No hay campos para actualizar",
      });
    }

    const [updated] = await context.db
      .update(contact)
      .set({ ...fields, modifiedBy: userId })
      .where(
        and(
          eq(contact.id, id),
          isNull(contact.archived),
          ownContactsSql(context)
        )
      )
      .returning({ id: contact.id });

    if (!updated) {
      throw new ORPCError("NOT_FOUND", {
        message: "El contacto no existe o está archivado",
      });
    }

    return updated;
  });
