import { z } from "zod";

export const USER_ROLES = ["user", "admin"] as const;

// Shared by the web form and the API, so it must stay free of drizzle imports.
export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "El nombre debe tener al menos 5 caracteres")
    .max(100, "Máximo 100 caracteres"),
  email: z.email("El correo no es válido").toLowerCase(),
  role: z.enum(USER_ROLES, { message: "Selecciona un rol" }),
});
