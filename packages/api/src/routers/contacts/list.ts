import { z } from "zod";

import { isAdmin, protectedProcedure } from "../../index";

export const list = protectedProcedure
  .route({ method: "GET", path: "/" })
  .input(
    z.object({
      customerId: z.string().optional(),
      branchId: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    const admin = await isAdmin(context, userId);

    return context.db.query.contact.findMany({
      where: {
        customerId: input.customerId,
        branchId: input.branchId,
        branch: admin ? undefined : { sellerId: userId },
      },
      columns: admin ? undefined : { modifiedBy: false },
      with: { branch: { columns: { id: true, name: true } } },
    });
  });
