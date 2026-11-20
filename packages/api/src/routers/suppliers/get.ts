import { supplierIdSchema } from "@suni/db/validation/suppliers";

import { protectedProcedure } from "../../index";

export const get = protectedProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(supplierIdSchema)
  .handler(async ({ input, context, errors }) => {
    const found = await context.db.query.supplier.findFirst({
      where: { id: input.id },
    });

    if (!found) {
      throw errors.NOT_FOUND({ message: "El proveedor no existe" });
    }

    return found;
  });
