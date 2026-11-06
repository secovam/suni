import { z } from "zod";

import { emptyToNull, required } from "./shared";

export const branchFormSchema = z.object({
  name: required("El nombre de la sucursal es requerido"),
  street: required("La calle es requerida"),
  intNumber: z.string().trim().max(20, "Máximo 20 caracteres"),
  extNumber: required("El número exterior es requerido"),
  city: required("El municipio es requerido"),
  suburb: required("La colonia es requerida"),
  state: required("El estado es requerido"),
  postalCode: z.string().regex(/^\d{5}$/u, "Debe tener 5 dígitos"),
  phone: z.string().regex(/^(?:\d{10})?$/u, "Debe tener 10 dígitos"),
  frontImageUrl: z.string().trim().max(2048, "URL demasiado larga"),
});

export const branchInputSchema = branchFormSchema.extend({
  intNumber: emptyToNull(branchFormSchema.shape.intNumber),
  phone: emptyToNull(branchFormSchema.shape.phone),
  frontImageUrl: emptyToNull(branchFormSchema.shape.frontImageUrl),
});

export const createBranchSchema = branchInputSchema.extend({
  customerId: required("El cliente es requerido"),
});

export const updateBranchSchema = branchInputSchema.partial().extend({
  archived: z.coerce.date().nullable().optional(),
});
