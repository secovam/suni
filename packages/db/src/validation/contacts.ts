import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  email: z.email("Correo inválido"),
  phone: z.string().regex(/^(?:\d{10})?$/u, "Debe tener 10 dígitos"),
  phoneExtension: z.string().regex(/^\d{0,10}$/u, "Solo dígitos"),
  position: z.string().trim().max(100, "Máximo 100 caracteres"),
});

export const createContactSchema = contactSchema.extend({
  customerId: z.string().min(1, "El cliente es requerido"),
  branchId: z.string().min(1, "La sucursal es requerida"),
});
