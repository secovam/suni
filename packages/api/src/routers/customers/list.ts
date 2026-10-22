import { customer } from "@suni/db/schema/customers";
import { asc, isNull } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../../index";

export const list = adminProcedure
  .route({ method: "GET", path: "/" })
  .input(z.object({ includeArchived: z.boolean().default(false) }))
  .handler(({ input, context }) =>
    context.db
      .select()
      .from(customer)
      .where(input.includeArchived ? undefined : isNull(customer.archived))
      .orderBy(asc(customer.name))
  );
