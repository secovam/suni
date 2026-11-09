import { z } from "zod";

import { ACQUISITION_CHANNELS, CUSTOMER_TYPES } from "../schema/customer-enums";

// Shared by the web form and the API, so it must stay free of drizzle imports.
export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "La razón social es requerida")
    .max(254, "Máximo 254 caracteres"),
  rfc: z.string().regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/u, "RFC inválido"),
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
    .max(100, "Máximo 100 caracteres"),
  suburb: z
    .string()
    .trim()
    .min(1, "La colonia es requerida")
    .max(100, "Máximo 100 caracteres"),
  state: z
    .string()
    .trim()
    .min(1, "El estado es requerido")
    .max(50, "Máximo 50 caracteres"),
  postalCode: z.string().regex(/^\d{5}$/u, "Debe tener 5 dígitos"),
  phone: z.string().regex(/^\d{10}$/u, "Debe tener 10 dígitos"),
  phoneExtension: z.string().regex(/^\d{0,10}$/u, "Solo dígitos"),
  acquisition: z.enum(ACQUISITION_CHANNELS, {
    message: "Selecciona un medio de adquisición",
  }),
  type: z.enum(CUSTOMER_TYPES),
});

export const createCustomerSchema = customerSchema;
