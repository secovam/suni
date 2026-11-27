import { defineRelations, defineRelationsPart } from "drizzle-orm";

import {
  account,
  authRelations,
  session,
  user,
  verification,
} from "./schema/auth";
import { branch } from "./schema/branches";
import { contact } from "./schema/contacts";
import { customer } from "./schema/customers";
import { ingredient } from "./schema/ingredients";
import {
  purchase,
  purchaseOrder,
  purchaseOrderItem,
} from "./schema/purchase-orders";
import { supplier } from "./schema/suppliers";

const customerRelations = defineRelationsPart({ customer, user }, (r) => ({
  customer: {
    seller: r.one.user({
      from: r.customer.sellerId,
      to: r.user.id,
      optional: false,
    }),
  },
}));

const branchRelations = defineRelationsPart(
  { branch, contact, customer, user },
  (r) => ({
    branch: {
      customer: r.one.customer({
        from: r.branch.customerId,
        to: r.customer.id,
        optional: false,
      }),
      seller: r.one.user({
        from: r.branch.sellerId,
        to: r.user.id,
        optional: false,
      }),
      contacts: r.many.contact({
        from: r.branch.id,
        to: r.contact.branchId,
      }),
    },
  })
);

const contactRelations = defineRelationsPart(
  { branch, contact, customer },
  (r) => ({
    contact: {
      customer: r.one.customer({
        from: r.contact.customerId,
        to: r.customer.id,
        optional: false,
      }),
      branch: r.one.branch({
        from: r.contact.branchId,
        to: r.branch.id,
      }),
    },
  })
);

const ingredientRelations = defineRelationsPart(
  { ingredient, supplier },
  (r) => ({
    ingredient: {
      supplier: r.one.supplier({
        from: r.ingredient.supplierId,
        to: r.supplier.id,
        optional: false,
      }),
    },
  })
);

const purchaseRelations = defineRelationsPart(
  { ingredient, purchase, purchaseOrder, purchaseOrderItem, supplier, user },
  (r) => ({
    purchase: {
      createdByUser: r.one.user({
        from: r.purchase.createdBy,
        to: r.user.id,
        optional: false,
      }),
      modifiedByUser: r.one.user({
        from: r.purchase.modifiedBy,
        to: r.user.id,
        optional: false,
      }),
      orders: r.many.purchaseOrder({
        from: r.purchase.id,
        to: r.purchaseOrder.purchaseId,
      }),
    },
    purchaseOrder: {
      purchase: r.one.purchase({
        from: r.purchaseOrder.purchaseId,
        to: r.purchase.id,
        optional: false,
      }),
      supplier: r.one.supplier({
        from: r.purchaseOrder.supplierId,
        to: r.supplier.id,
        optional: false,
      }),
      items: r.many.purchaseOrderItem({
        from: r.purchaseOrder.id,
        to: r.purchaseOrderItem.purchaseOrderId,
      }),
    },
    purchaseOrderItem: {
      purchaseOrder: r.one.purchaseOrder({
        from: r.purchaseOrderItem.purchaseOrderId,
        to: r.purchaseOrder.id,
        optional: false,
      }),
      ingredient: r.one.ingredient({
        from: r.purchaseOrderItem.ingredientId,
        to: r.ingredient.id,
        optional: false,
      }),
    },
  })
);

export const relations = {
  ...defineRelations({
    account,
    session,
    user,
    verification,
    customer,
    branch,
    contact,
    ingredient,
    purchase,
    purchaseOrder,
    purchaseOrderItem,
    supplier,
  }),
  ...authRelations,
  ...customerRelations,
  ...branchRelations,
  ...contactRelations,
  ...ingredientRelations,
  ...purchaseRelations,
};
