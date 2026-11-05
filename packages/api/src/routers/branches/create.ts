import { branch } from "@suni/db/schema/branches";
import { createBranchSchema } from "@suni/db/validation/branches";

import { protectedProcedure } from "../../index";

export const create = protectedProcedure
  .route({ method: "POST", path: "/" })
  .input(createBranchSchema)
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;

    const [created] = await context.db
      .insert(branch)
      .values({ ...input, sellerId: userId, modifiedBy: userId })
      .returning({ id: branch.id });

    return created;
  });
