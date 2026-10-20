import { user } from "@suni/db/schema/auth";
import { desc, ilike, or } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../../index";

export const list = adminProcedure
  .route({ method: "GET", path: "/" })
  .input(
    z.object({
      limit: z.coerce.number().int().min(1).max(100).default(20),
      offset: z.coerce.number().int().min(0).default(0),
      search: z.string().trim().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const where = input.search
      ? or(
          ilike(user.name, `%${input.search}%`),
          ilike(user.email, `%${input.search}%`)
        )
      : undefined;

    const [items, total] = await Promise.all([
      context.db
        .select()
        .from(user)
        .where(where)
        .orderBy(desc(user.createdAt))
        .limit(input.limit)
        .offset(input.offset),

      context.db.$count(user, where),
    ]);

    return { items, total };
  });
