import { ORPCError } from "@orpc/server";
import { user } from "@suni/db/schema/auth";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../../index";
import { role } from "./role";

export const update = adminProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(2).optional(),
      email: z.email().toLowerCase().optional(),
      image: z.url().nullable().optional(),
      role: role.optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const { id, ...values } = input;

    if (Object.values(values).every((v) => v === undefined)) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No hay campos para actualizar",
      });
    }

    if (values.email) {
      const [taken] = await context.db
        .select({ id: user.id })
        .from(user)
        .where(and(eq(user.email, values.email), ne(user.id, id)))
        .limit(1);

      if (taken) {
        throw new ORPCError("CONFLICT", { message: "El correo ya existe" });
      }
    }

    const [updated] = await context.db
      .update(user)
      .set(values)
      .where(eq(user.id, id))
      .returning();

    if (!updated) {
      throw new ORPCError("NOT_FOUND");
    }

    return updated;
  });
