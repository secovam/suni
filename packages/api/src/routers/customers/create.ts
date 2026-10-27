import { customer } from "@suni/db/schema/customers";
import { customerInputSchema } from "@suni/db/validation/customers";

import { adminProcedure } from "../../index";

export const create = adminProcedure
  .route({ method: "POST", path: "/" })
  .input(customerInputSchema)
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;

    const [created] = await context.db
      .insert(customer)
      .values({ ...input, sellerId: userId, modifiedBy: userId })
      .returning();

    return created;
  });
