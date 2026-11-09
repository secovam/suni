import { z } from "zod";

import { scopedProcedure } from "../../index";
import { ownBranches } from "../../util/scope";

export const get = scopedProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context, errors }) => {
    const { admin } = context;

    const found = await context.db.query.branch.findFirst({
      where: { id: input.id, ...ownBranches(context) },
      columns: admin ? undefined : { sellerId: false, modifiedBy: false },
      with: {
        customer: { columns: { id: true, name: true, archived: true } },
        contacts: true,
        ...(admin && { seller: { columns: { id: true, name: true } } }),
      },
    });

    if (!found) {
      throw errors.NOT_FOUND({ message: "La sucursal no existe" });
    }

    return admin ? found : { ...found, seller: null };
  });
