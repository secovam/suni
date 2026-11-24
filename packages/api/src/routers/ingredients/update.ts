import { ingredient } from "@suni/db/schema/ingredients";
import { supplier } from "@suni/db/schema/suppliers";
import { ingredientUpdateSchema } from "@suni/db/validation/ingredients";
import { and, eq, exists, inArray, isNull } from "drizzle-orm";

import { adminProcedure } from "../../index";
import { activeSupplierIdsSql } from "../../util/status";

export const update = adminProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(ingredientUpdateSchema)
  .handler(async ({ input, context, errors }) => {
    const { id, ...fields } = input;
    const activeSuppliers = activeSupplierIdsSql(context.db);

    const [updated] = await context.db
      .update(ingredient)
      .set({ ...fields, modifiedBy: context.userId })
      .where(
        and(
          eq(ingredient.id, id),
          isNull(ingredient.archived),
          inArray(ingredient.supplierId, activeSuppliers),
          exists(
            activeSupplierIdsSql(context.db, eq(supplier.id, fields.supplierId))
          )
        )
      )
      .returning({ id: ingredient.id });

    if (!updated) {
      throw errors.NOT_FOUND({
        message: "El ingrediente o su proveedor no existe o está archivado",
      });
    }

    return updated;
  });
