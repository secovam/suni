import { z } from "zod";

import { scopedProcedure } from "../../index";
import { ownCustomers } from "../../util/scope";

export const get = scopedProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context, errors }) => {
    const where = { id: input.id, ...ownCustomers(context) };

    if (context.admin) {
      const found = await context.db.query.customer.findFirst({
        where,
        with: { seller: { columns: { id: true, name: true } } },
      });

      if (!found) {
        throw errors.NOT_FOUND({ message: "El cliente no existe" });
      }

      return found;
    }

    // Seller identity is admin-only.
    const found = await context.db.query.customer.findFirst({
      where,
      columns: { sellerId: false, modifiedBy: false },
    });

    if (!found) {
      throw errors.NOT_FOUND({ message: "El cliente no existe" });
    }

    return { ...found, seller: null };
  });
