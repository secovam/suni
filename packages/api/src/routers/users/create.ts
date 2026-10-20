import { APIError } from "@suni/auth";
import { z } from "zod";

import { adminProcedure } from "../../index";
import { toORPCError } from "./errors";
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
