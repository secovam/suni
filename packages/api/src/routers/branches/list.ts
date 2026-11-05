import { z } from "zod";

import { isAdmin, protectedProcedure } from "../../index";

export const list = protectedProcedure
  .route({ method: "GET", path: "/" })
  .input(z.object({ customerId: z.string().optional() }))
  .handler(async ({ input, context }) => {
    const where = input.customerId ? { customerId: input.customerId } : {};

    if (await isAdmin(context, context.session.user.id)) {
      return context.db.query.branch.findMany({
        where,
        with: {
          customer: { columns: { id: true, name: true } },
          seller: { columns: { id: true, name: true } },
        },
      });
    }

    // Seller identity is admin-only.
    const rows = await context.db.query.branch.findMany({
      where: { ...where, sellerId: context.session.user.id },
      columns: { sellerId: false, modifiedBy: false },
      with: { customer: { columns: { id: true, name: true } } },
    });

    return rows.map((row) => ({ ...row, seller: null }));
  });
