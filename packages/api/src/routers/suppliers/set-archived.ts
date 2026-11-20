import { supplier } from "@suni/db/schema/suppliers";
import { supplierArchiveSchema } from "@suni/db/validation/suppliers";
import { eq } from "drizzle-orm";

import { adminProcedure } from "../../index";
import { archivedValue } from "../../util/status";

export const setArchived = adminProcedure
  .route({ method: "POST", path: "/{id}/archived" })
  .input(supplierArchiveSchema)
  .handler(async ({ input, context, errors }) => {
    const [updated] = await context.db
      .update(supplier)
      .set({
        archived: archivedValue(supplier.archived, input.archived),
        modifiedBy: context.userId,
      })
      .where(eq(supplier.id, input.id))
      .returning({ id: supplier.id });

    if (!updated) {
      throw errors.NOT_FOUND({ message: "El proveedor no existe" });
    }

    return updated;
  });
