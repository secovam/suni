import { ORPCError, os } from "@orpc/server";
import { user } from "@suni/db/schema/auth";
import { eq } from "drizzle-orm";

import type { Context } from "./context";

export const o = os.$context<Context>().errors({
  NOT_FOUND: { message: "El registro no existe" },
});

export const publicProcedure = o;

const requireAuth = o.middleware(({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Inicia sesión para continuar",
    });
  }

  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

async function isAdmin(context: Pick<Context, "db">, userId: string) {
  const [currentUser] = await context.db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return currentUser?.role === "admin";
}

// Role is read from the database, not the cached session, so revocations apply immediately.
export const scopedProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    const userId = context.session.user.id;

    return next({
      context: { userId, admin: await isAdmin(context, userId) },
    });
  }
);

export const adminProcedure = scopedProcedure.use(({ context, next }) => {
  if (!context.admin) {
    throw new ORPCError("FORBIDDEN", {
      message: "No tienes permiso para esta acción",
    });
  }

  return next();
});
