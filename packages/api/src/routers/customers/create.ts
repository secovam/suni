import { customer } from "@suni/db/schema/customers";
import { createInsertSchema } from "drizzle-orm/zod";

import { adminProcedure } from "../../index";

export const create = adminProcedure
  .route({ method: "POST", path: "/" })
  .input(
    createInsertSchema(customer).omit({
      id: true,
      sellerId: true,
      modifiedBy: true,
      createdAt: true,
      updatedAt: true,
      archived: true,
    })
  )
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;

    const [created] = await context.db
      .insert(customer)
      .values({ ...input, sellerId: userId, modifiedBy: userId })
      .returning();

    return created;
  });
