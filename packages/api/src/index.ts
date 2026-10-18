import { ORPCError, os } from "@orpc/server";
import { user } from "@suni/db/schema/auth";
import { eq } from "drizzle-orm";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

export const adminProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    const [currentUser] = await context.db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, context.session.user.id))
      .limit(1);

    if (currentUser?.role !== "admin") {
      throw new ORPCError("FORBIDDEN");
    }

    return next();
  }
);
