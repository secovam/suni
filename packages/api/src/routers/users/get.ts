import { ORPCError } from "@orpc/server";
import { user } from "@suni/db/schema/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../../index";

export const get = adminProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const [row] = await context.db
      .select()
      .from(user)
      .where(eq(user.id, input.id))
      .limit(1);

    if (!row) {
      throw new ORPCError("NOT_FOUND");
    }

    return row;
  });
