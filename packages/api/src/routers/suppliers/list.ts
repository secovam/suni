import { supplierListSchema } from "@suni/db/validation/suppliers";

import { protectedProcedure } from "../../index";
import { statusWhere } from "../../util/status";

export const list = protectedProcedure
  .route({ method: "GET", path: "/" })
  .input(supplierListSchema)
  .handler(({ input, context }) =>
    context.db.query.supplier.findMany({
      where: statusWhere("supplier", input.status),
    })
  );
