import { z } from "zod";

import { scopedProcedure } from "../../index";
import { ownContacts } from "../../util/scope";

export const get = scopedProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context, errors }) => {
    const { admin } = context;

    const found = await context.db.query.contact.findFirst({
      where: { id: input.id, ...ownContacts(context) },
      columns: admin ? undefined : { modifiedBy: false },
      with: {
        branch: { columns: { id: true, name: true, archived: true } },
        customer: { columns: { id: true, name: true, archived: true } },
      },
    });

    if (!found) {
      throw errors.NOT_FOUND({ message: "El contacto no existe" });
    }

    return found;
  });
