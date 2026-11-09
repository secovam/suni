import { APIError } from "@suni/auth";
import { USER_ROLES, userSchema } from "@suni/db/validation/users";
import { z } from "zod";

import { adminProcedure } from "../../index";
import { toORPCError } from "./errors";

export const create = adminProcedure
  .route({ method: "POST", path: "/" })
  .input(userSchema.extend({ role: z.enum(USER_ROLES).default("user") }))
  .handler(async ({ input, context }) => {
    try {
      const { user } = await context.auth.api.createUser({
        body: { ...input, data: { emailVerified: true } },
        headers: context.headers,
      });

      return user;
    } catch (error) {
      if (error instanceof APIError) {
        throw toORPCError(error);
      }

      throw error;
    }
  });
