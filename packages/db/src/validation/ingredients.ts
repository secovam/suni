import { z } from "zod";

import { INGREDIENT_UNITS } from "../schema/ingredient-enums";
import { ID_LENGTH } from "./ids";

export const ingredientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre de la sustancia es requerido")
    .max(254, "Máximo 254 caracteres"),
  supplierId: z
    .string()
    .length(ID_LENGTH, "Identificador de proveedor inválido"),
  unit: z.enum(INGREDIENT_UNITS, "Unidad de medida inválida"),
  imageUrl: z
    .string()
    .trim()
    .max(2048, "Máximo 2048 caracteres")
    .pipe(
      z.union([
        z.literal(""),
        z.url({
          error: "La imagen debe tener una URL HTTP o HTTPS válida",
          protocol: /^https?$/u,
        }),
      ])
    )
    .default(""),
});

export const ingredientIdSchema = z.object({
  id: z.string().length(ID_LENGTH, "Identificador de ingrediente inválido"),
});

export const ingredientListSchema = z.object({
  status: z.enum(["active", "archived", "all"]).default("active"),
});

export const ingredientUpdateSchema = ingredientSchema.extend({
  ...ingredientIdSchema.shape,
  imageUrl: ingredientSchema.shape.imageUrl.removeDefault().optional(),
});

export const ingredientArchiveSchema = ingredientIdSchema.extend({
  archived: z.boolean(),
});
