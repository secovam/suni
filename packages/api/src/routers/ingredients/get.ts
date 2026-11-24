import { ingredientIdSchema } from "@suni/db/validation/ingredients";

import { protectedProcedure } from "../../index";

export const get = protectedProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(ingredientIdSchema)
  .handler(async ({ input, context, errors }) => {
    const found = await context.db.query.ingredient.findFirst({
      where: { id: input.id },
      with: { supplier: { columns: { id: true, name: true } } },
    });

    if (!found) {
      throw errors.NOT_FOUND({ message: "El ingrediente no existe" });
    }

    return found;
  });
