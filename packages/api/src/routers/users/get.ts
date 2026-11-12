import { user } from "@suni/db/schema/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../../index";

export const get = adminProcedure
  .route({ method: "GET", path: "/{id}" })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context, errors }) => {
    const [row] = await context.db
      .select()
      .from(user)
      .where(eq(user.id, input.id))
      .limit(1);

    if (!row) {
      throw errors.NOT_FOUND({ message: "El usuario no existe" });
    }

    return row;
  });
