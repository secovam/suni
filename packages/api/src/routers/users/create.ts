import { ORPCError } from "@orpc/server";
import { user } from "@suni/db/schema/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../../index";
import { role } from "./role";

export const create = adminProcedure
  .route({ method: "POST", path: "/" })
  .input(
    z.object({
      name: z.string().min(2),
      email: z.email().toLowerCase(),
      role: role.default("user"),
    })
  )
  .handler(async ({ input, context }) => {
    const [existingUser] = await context.db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, input.email))
      .limit(1);

    if (existingUser) {
      throw new ORPCError("CONFLICT", {
        message: "Un usuario con ese correo ya existe",
      });
    }

    const [createdUser] = await context.db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        name: input.name,
        email: input.email,
        emailVerified: true,
        role: input.role,
      })
      .returning();

    return createdUser;
  });
