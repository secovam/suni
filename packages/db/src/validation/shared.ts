import { z } from "zod";

export function required(message = "Campo requerido") {
  return z.string().trim().min(1, message).max(255, "Máximo 255 caracteres");
}

export function emptyToNull(schema: z.ZodString) {
  return schema.nullable().transform((value) => value || null);
}
