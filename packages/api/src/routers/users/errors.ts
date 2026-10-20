import { ORPCError } from "@orpc/server";
import type { APIError } from "@suni/auth";

export function toORPCError(error: APIError) {
  if (error.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
    return new ORPCError("CONFLICT", {
      message: "Un usuario con ese correo ya existe",
    });
  }

  return new ORPCError(String(error.status), {
    cause: error,
    message: error.body?.message,
    status: error.statusCode,
  });
}
