import { z } from "zod";

import { emptyToNull, required } from "./shared";

export const contactFormSchema = z.object({
  name: required("El nombre es requerido"),
  email: z.email("Correo inválido"),
  phone: z.string().regex(/^(?:\d{10})?$/u, "Debe tener 10 dígitos"),
  phoneExtension: z.string().regex(/^\d{0,10}$/u, "Solo dígitos"),
  position: z.string().trim().max(255, "Máximo 255 caracteres"),
});

export const contactInputSchema = contactFormSchema.extend({
  phoneExtension: emptyToNull(contactFormSchema.shape.phoneExtension),
  position: emptyToNull(contactFormSchema.shape.position),
});

export const createContactSchema = contactInputSchema.extend({
  customerId: required("El cliente es requerido"),
  branchId: required("La sucursal es requerida"),
});

export const updateContactSchema = contactInputSchema.partial().extend({
  customerId: required("El cliente es requerido").optional(),
  archived: z.coerce.date().nullable().optional(),
});
