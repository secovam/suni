import { supplier } from "@suni/db/schema/suppliers";
import { supplierSchema } from "@suni/db/validation/suppliers";

import { adminProcedure } from "../../index";

export const create = adminProcedure
  .route({ method: "POST", path: "/" })
  .input(supplierSchema)
  .handler(async ({ input, context }) => {
    const { userId } = context;

    const [created] = await context.db
      .insert(supplier)
      .values({ ...input, modifiedBy: userId })
      .returning({ id: supplier.id });

    return created;
  });
