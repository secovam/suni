import { CUSTOMER_STATUSES } from "@suni/db/schema/customer-enums";
import { z } from "zod";

import { scopedProcedure } from "../../index";
import { ownContacts } from "../../util/scope";
import { statusWhere } from "../../util/status";

export const list = scopedProcedure
  .route({ method: "GET", path: "/" })
  .input(
    z.object({
      customerId: z.string().optional(),
      branchId: z.string().optional(),
      status: z.enum(CUSTOMER_STATUSES).default("active"),
    })
  )
  .handler(({ input, context }) =>
    context.db.query.contact.findMany({
      where: {
        AND: [
          statusWhere("contact", input.status),
          { customerId: input.customerId, branchId: input.branchId },
          ownContacts(context),
        ],
      },
      columns: context.admin ? undefined : { modifiedBy: false },
      with: {
        branch: { columns: { id: true, name: true, archived: true } },
        customer: { columns: { id: true, name: true, archived: true } },
      },
    })
  );
