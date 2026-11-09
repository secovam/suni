import { ORPCError } from "@orpc/server";
import { APIError } from "@suni/auth";
import { z } from "zod";

import { adminProcedure } from "../../index";
import { toORPCError } from "./errors";
import { role } from "./role";

export const update = adminProcedure
  .route({ method: "PATCH", path: "/{id}" })
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(2),
      email: z.email().toLowerCase(),
      role,
    })
  )
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
