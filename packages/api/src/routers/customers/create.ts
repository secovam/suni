import { customer } from "@suni/db/schema/customers";
import { customerInputSchema } from "@suni/db/validation/customers";

import { isAdmin, protectedProcedure } from "../../index";

export const create = protectedProcedure
  .route({ method: "POST", path: "/" })
  .input(customerInputSchema)
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;

    const type = (await isAdmin(context, userId)) ? input.type : "Cliente";

    const [created] = await context.db
      .insert(customer)
      .values({ ...input, type, sellerId: userId, modifiedBy: userId })
      .returning();

    return created;
  });
