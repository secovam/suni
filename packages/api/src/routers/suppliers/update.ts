import { supplier } from "@suni/db/schema/suppliers";
import {
  supplierIdSchema,
  supplierSchema,
} from "@suni/db/validation/suppliers";
import { and, eq, isNull } from "drizzle-orm";

import { adminProcedure } from "../../index";

export const update = adminProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(supplierSchema.extend(supplierIdSchema.shape))
  .handler(async ({ input, context, errors }) => {
    const { id, ...fields } = input;

    const { userId } = context;

    const [updated] = await context.db
      .update(supplier)
      .set({ ...fields, modifiedBy: userId })
      // Archived suppliers are read-only until restored.
      .where(and(eq(supplier.id, id), isNull(supplier.archived)))
      .returning({ id: supplier.id });

    if (!updated) {
      throw errors.NOT_FOUND({
        message: "El proveedor no existe o está archivado",
      });
    }

    return updated;
  });
