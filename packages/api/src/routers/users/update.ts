import { ORPCError } from "@orpc/server";
import { APIError } from "@suni/auth";
import { userSchema } from "@suni/db/validation/users";
import { z } from "zod";

import { adminProcedure } from "../../index";
import { toORPCError } from "./errors";

export const update = adminProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(userSchema.extend({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const { id, ...data } = input;

    if (id === context.session.user.id && data.role !== "admin") {
      throw new ORPCError("FORBIDDEN", {
        message: "No puedes quitarte el rol de administrador",
      });
    }

    try {
      return await context.auth.api.adminUpdateUser({
        body: { userId: id, data },
        headers: context.headers,
      });
    } catch (error) {
      if (error instanceof APIError) {
        throw toORPCError(error);
      }

      throw error;
    }
  });
