import { CUSTOMER_STATUSES } from "@suni/db/schema/customer-enums";
import { z } from "zod";

import { isAdmin, protectedProcedure } from "../../index";
import { statusWhere } from "../../util/status";

export const list = protectedProcedure
  .route({ method: "GET", path: "/" })
  .input(
    z.object({
      customerId: z.string().optional(),
      branchId: z.string().optional(),
      status: z.enum(CUSTOMER_STATUSES).default("active"),
    })
  )
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    const admin = await isAdmin(context, userId);

    return context.db.query.contact.findMany({
      where: {
        AND: [
          statusWhere("contact", input.status),
          { customerId: input.customerId, branchId: input.branchId },
          ...(admin ? [] : [{ branch: { sellerId: userId } }]),
        ],
      },
      columns: admin ? undefined : { modifiedBy: false },
      with: {
        branch: { columns: { id: true, name: true, archived: true } },
        customer: { columns: { id: true, name: true, archived: true } },
      },
    });
  });
