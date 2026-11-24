import { ingredient } from "@suni/db/schema/ingredients";
import { ingredientArchiveSchema } from "@suni/db/validation/ingredients";
import { and, eq, inArray } from "drizzle-orm";

import { adminProcedure } from "../../index";
import { activeSupplierIdsSql, archivedValue } from "../../util/status";

export const setArchived = adminProcedure
  .route({ method: "POST", path: "/{id}/archived" })
  .input(ingredientArchiveSchema)
  .handler(async ({ input, context, errors }) => {
    const [updated] = await context.db
      .update(ingredient)
      .set({
        archived: archivedValue(ingredient.archived, input.archived),
        modifiedBy: context.userId,
      })
      .where(
        and(
          eq(ingredient.id, input.id),
          inArray(ingredient.supplierId, activeSupplierIdsSql(context.db))
        )
      )
      .returning({ id: ingredient.id });

    if (!updated) {
      throw errors.NOT_FOUND({
        message: "El ingrediente no existe o su proveedor está archivado",
      });
    }

    return updated;
  });
