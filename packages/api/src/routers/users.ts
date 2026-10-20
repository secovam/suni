import { ORPCError } from "@orpc/server";
import { user } from "@suni/db/schema/auth";
import { and, count, desc, eq, ilike, ne, or } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, protectedProcedure } from "../index";

const role = z.enum(["user", "admin"]);

export const usersRouter = {
  list: adminProcedure
    .route({ method: "GET", path: "/users", tags: ["Users"] })
    .input(
      z.object({
        limit: z.coerce.number().int().min(1).max(100).default(20),
        offset: z.coerce.number().int().min(0).default(0),
        search: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const where = input.search
        ? or(
            ilike(user.name, `%${input.search}%`),
            ilike(user.email, `%${input.search}%`)
          )
        : undefined;

      const [items, [counted]] = await Promise.all([
        context.db
          .select()
          .from(user)
          .where(where)
          .orderBy(desc(user.createdAt))
          .limit(input.limit)
          .offset(input.offset),
        context.db.select({ total: count() }).from(user).where(where),
      ]);

      return { items, total: counted?.total ?? 0 };
    }),

  get: adminProcedure
    .route({ method: "GET", path: "/users/{id}", tags: ["Users"] })
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
    }),

  create: adminProcedure
    .route({ method: "POST", path: "/users", tags: ["Users"] })
    .input(
      z.object({
        name: z.string().min(2),
        email: z.email().toLowerCase(),
        role: role.default("user"),
      })
    )
    .handler(async ({ input, context }) => {
      const [existing] = await context.db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, input.email))
        .limit(1);

      if (existing) {
        throw new ORPCError("CONFLICT", { message: "El correo ya existe" });
      }

      const [created] = await context.db
        .insert(user)
        .values({
          id: crypto.randomUUID(),
          name: input.name,
          email: input.email,
          emailVerified: true,
          role: input.role,
        })
        .returning();

      return created;
    }),

  update: adminProcedure
    .route({ method: "PATCH", path: "/users/{id}", tags: ["Users"] })
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
    }),

  me: protectedProcedure
    .route({ method: "GET", path: "/users/me", tags: ["Users"] })
    .handler(({ context }) => context.session.user),
};
