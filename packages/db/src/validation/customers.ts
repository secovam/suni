import { z } from "zod";

import { ACQUISITION_CHANNELS, CUSTOMER_TYPES } from "../schema/customer-enums";

function required(message = "Campo requerido") {
  return z.string().trim().min(1, message);
}

// Shared by the web form and the API, so it must stay free of drizzle imports.
export const customerFormSchema = z.object({
  name: required("La razón social es requerida"),
  rfc: z.string().regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/u, "RFC inválido"),
  street: required("La calle es requerida"),
  intNumber: z.string().trim(),
  extNumber: required("El número exterior es requerido"),
  city: required("El municipio es requerido"),
  suburb: required("La colonia es requerida"),
  state: required("El estado es requerido"),
  postalCode: z.string().regex(/^\d{5}$/u, "Debe tener 5 dígitos"),
  phone: z.string().regex(/^\d{10}$/u, "Debe tener 10 dígitos"),
  phoneExtension: z.string().trim(),
  acquisition: z.enum(ACQUISITION_CHANNELS, {
    message: "Selecciona un medio de adquisición",
  }),
  type: z.enum(CUSTOMER_TYPES),
});

function emptyToNull(schema: z.ZodString) {
  return schema.nullable().transform((value) => value || null);
}

// The form keeps "" for empty optional fields; the database stores null.
export const customerInputSchema = customerFormSchema.extend({
  intNumber: emptyToNull(customerFormSchema.shape.intNumber),
  phoneExtension: emptyToNull(customerFormSchema.shape.phoneExtension),
});
