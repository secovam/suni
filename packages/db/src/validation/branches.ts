import { z } from "zod";

const MAX_100_MESSAGE = "Máximo 100 caracteres";

export const branchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre de la sucursal es requerido")
    .max(100, MAX_100_MESSAGE),
  street: z
    .string()
    .trim()
    .min(1, "La calle es requerida")
    .max(150, "Máximo 150 caracteres"),
  intNumber: z.string().trim().max(20, "Máximo 20 caracteres"),
  extNumber: z
    .string()
    .trim()
    .min(1, "El número exterior es requerido")
    .max(20, "Máximo 20 caracteres"),
  city: z
    .string()
    .trim()
    .min(1, "El municipio es requerido")
    .max(100, MAX_100_MESSAGE),
  suburb: z
    .string()
    .trim()
    .min(1, "La colonia es requerida")
    .max(100, MAX_100_MESSAGE),
  state: z
    .string()
    .trim()
    .min(1, "El estado es requerido")
    .max(50, "Máximo 50 caracteres"),
  postalCode: z.string().regex(/^\d{5}$/u, "Debe tener 5 dígitos"),
  phone: z.string().regex(/^(?:\d{10})?$/u, "Debe tener 10 dígitos"),
  frontImageUrl: z.string().trim().max(2048, "URL demasiado larga"),
});

export const createBranchSchema = branchSchema.extend({
  customerId: z.string().min(1, "El cliente es requerido"),
});
