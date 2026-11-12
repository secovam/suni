import { branch } from "@suni/db/schema/branches";
import { createBranchSchema } from "@suni/db/validation/branches";

import { scopedProcedure } from "../../index";
import { ownCustomers } from "../../util/scope";
import { statusWhere } from "../../util/status";

export const create = scopedProcedure
  .route({ method: "POST", path: "/" })
  .input(createBranchSchema)
  .handler(async ({ input, context, errors }) => {
    const { userId } = context;

    const parent = await context.db.query.customer.findFirst({
      where: {
        AND: [
          { id: input.customerId },
          statusWhere("customer", "active"),
          ownCustomers(context),
        ],
      },
      columns: { id: true },
    });

    if (!parent) {
      throw errors.NOT_FOUND({
        message: "El cliente no existe o está archivado",
      });
    }

    const [created] = await context.db
      .insert(branch)
      .values({ ...input, sellerId: userId, modifiedBy: userId })
      .returning({ id: branch.id });

    return created;
  });
