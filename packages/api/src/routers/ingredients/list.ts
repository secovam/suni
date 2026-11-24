import { ingredientListSchema } from "@suni/db/validation/ingredients";

import { protectedProcedure } from "../../index";
import { statusWhere } from "../../util/status";

export const list = protectedProcedure
  .route({ method: "GET", path: "/" })
  .input(ingredientListSchema)
  .handler(({ input, context }) =>
    context.db.query.ingredient.findMany({
      where: statusWhere("ingredient", input.status),
      with: { supplier: { columns: { id: true, name: true } } },
    })
  );
