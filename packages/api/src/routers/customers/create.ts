import { customer } from "@suni/db/schema/customers";
import { createCustomerSchema } from "@suni/db/validation/customers";

import { scopedProcedure } from "../../index";

export const create = scopedProcedure
  .route({ method: "POST", path: "/" })
  .input(createCustomerSchema)
  .handler(async ({ input, context }) => {
    const { userId } = context;

    const type = context.admin ? input.type : "Cliente";

    const [created] = await context.db
      .insert(customer)
      .values({ ...input, type, sellerId: userId, modifiedBy: userId })
      .returning({ id: customer.id });

    return created;
  });
