import { z } from "zod";

import { PURCHASE_ORDER_STATUSES } from "../schema/purchase-order-enums";
import { ID_LENGTH } from "./ids";
import { ingredientIdSchema, ingredientSchema } from "./ingredients";
import { supplierIdSchema } from "./suppliers";

export const purchaseIdSchema = z.object({
  id: z.string().length(ID_LENGTH, "Identificador de compra inválido"),
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

export const purchaseCreateSchema = z
  .object({
    status: z.enum(["draft", "generated"]).default("generated"),
    notes: z.string().trim().max(2000, "Máximo 2000 caracteres").default(""),
    items: z
      .array(purchaseOrderItemSchema)
      .min(1, "Agrega al menos una partida")
      .max(500, "Máximo 500 partidas por compra"),
  })
  .superRefine(({ status, items }, context) => {
    if (status === "generated") {
      for (const [index, item] of items.entries()) {
        if (item.unitPrice === null) {
          context.addIssue({
            code: "custom",
            path: ["items", index, "unitPrice"],
            message: "Indica el precio unitario para generar la orden",
          });
        }
      }
    }
  });

export const purchaseUpdateSchema = z.union([
  purchaseCreateSchema.safeExtend(purchaseIdSchema.shape),
  purchaseIdSchema.extend({
    status: z.enum(["sent", "confirmed", "cancelled"]),
  }),
]);

const purchaseListFilters = z.object({
  status: z.enum(PURCHASE_ORDER_STATUSES).optional(),
});

export const purchaseSearchSchema = z.object({
  supplierId: supplierIdSchema.shape.id.optional(),
  ingredientId: ingredientIdSchema.shape.id.optional(),
  folio: z.string().trim().max(100).optional(),
  dateFrom: z.iso.date().optional(),
  dateTo: z.iso.date().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const purchaseListSchema = z.discriminatedUnion("scope", [
  purchaseListFilters.extend({
    ...purchaseSearchSchema.shape,
    scope: z.literal("purchase"),
  }),
  purchaseListFilters.extend({
    scope: z.literal("supplierOrder"),
    supplierId: supplierIdSchema.shape.id,
  }),
]);
