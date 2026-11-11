import { z } from "zod";

import { scopedProcedure } from "../../index";
import {
  ownBranches,
  sellerColumns,
  sellerRelation,
  withSeller,
} from "../../util/scope";

export const get = scopedProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context, errors }) => {
    const found = await context.db.query.branch.findFirst({
      where: { id: input.id, ...ownBranches(context) },
      columns: sellerColumns(context),
      with: {
        customer: { columns: { id: true, name: true, archived: true } },
        ...sellerRelation(context),
      },
    });

    if (!found) {
      throw errors.NOT_FOUND({ message: "La sucursal no existe" });
    }

    return withSeller(context, found);
  });
