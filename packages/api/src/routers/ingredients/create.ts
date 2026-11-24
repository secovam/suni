import { ingredient } from "@suni/db/schema/ingredients";
import { supplier } from "@suni/db/schema/suppliers";
import { ingredientSchema } from "@suni/db/validation/ingredients";
import { and, eq, isNull } from "drizzle-orm";

import { adminProcedure } from "../../index";

export const create = adminProcedure
  .route({ method: "POST", path: "/" })
  .input(ingredientSchema)
  .handler(({ input, context, errors }) =>
    context.db.transaction(async (tx) => {
      const [parent] = await tx
        .select({ id: supplier.id })
        .from(supplier)
        .where(
          and(eq(supplier.id, input.supplierId), isNull(supplier.archived))
        )
        .for("share");

      if (!parent) {
        throw errors.NOT_FOUND({
          message: "El proveedor no existe o está archivado",
        });
      }

      const [created] = await tx
        .insert(ingredient)
        .values({ ...input, modifiedBy: context.userId })
        .returning({ id: ingredient.id });

      return created;
    })
  );
