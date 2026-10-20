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
      name: z.string().min(2).optional(),
      email: z.email().toLowerCase().optional(),
      image: z.url().nullable().optional(),
      role: role.optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const { id, ...data } = input;

    if (Object.values(data).every((v) => v === undefined)) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No hay campos para actualizar",
      });
    }

    if (
      id === context.session.user.id &&
      data.role !== undefined &&
      data.role !== "admin"
    ) {
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
