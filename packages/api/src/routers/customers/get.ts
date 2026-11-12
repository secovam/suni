import { z } from "zod";

import { scopedProcedure } from "../../index";
import {
  ownCustomers,
  sellerColumns,
  sellerRelation,
  withSeller,
} from "../../util/scope";

export const get = scopedProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context, errors }) => {
    const found = await context.db.query.customer.findFirst({
      where: { id: input.id, ...ownCustomers(context) },
      columns: sellerColumns(context),
      with: sellerRelation(context),
    });

    if (!found) {
      throw errors.NOT_FOUND({ message: "El cliente no existe" });
    }

    return withSeller(context, found);
  });
