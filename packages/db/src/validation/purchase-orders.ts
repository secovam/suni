import { z } from "zod";

import { PURCHASE_ORDER_STATUSES } from "../schema/purchase-order-enums";
import { ID_LENGTH } from "./ids";
import { ingredientIdSchema, ingredientSchema } from "./ingredients";
import { supplierIdSchema } from "./suppliers";

export const purchaseIdSchema = z.object({
  id: z.string().length(ID_LENGTH, "Identificador de compra inválido"),
});

export const purchaseOrderIdSchema = z.object({
  id: z.string().length(ID_LENGTH, "Identificador de orden de compra inválido"),
});

export const purchaseOrderItemSchema = z.object({
  ingredientId: ingredientIdSchema.shape.id,
  quantity: z
    .string()
    .trim()
    .regex(
      /^\d{1,11}(?:[.,]\d{1,3})?$/u,
      "Ingresa una cantidad con hasta 11 dígitos enteros y 3 decimales"
    )
    .transform((value) => value.replace(",", "."))
    .refine(
      (value) => Number(value) > 0,
      "La cantidad debe ser mayor que cero"
    ),
  unitPrice: ingredientSchema.shape.price,
});

export const purchaseDraftSchema = z.object({
  notes: z.string().trim().max(2000, "Máximo 2000 caracteres").default(""),
  items: z.array(purchaseOrderItemSchema).min(1, "Agrega al menos una partida"),
});

export const purchaseUpdateSchema = purchaseDraftSchema.extend(
  purchaseIdSchema.shape
);

export const purchaseListSchema = z.object({
  status: z.enum(PURCHASE_ORDER_STATUSES).optional(),
});

export const supplierPurchaseOrderListSchema = purchaseListSchema.extend({
  supplierId: supplierIdSchema.shape.id,
});
