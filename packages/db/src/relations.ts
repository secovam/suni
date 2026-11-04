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

export const relations = {
  ...defineRelations({
    account,
    session,
    user,
    verification,
    customer,
    branch,
    contact,
  }),
  ...authRelations,
  ...customerRelations,
  ...branchRelations,
  ...contactRelations,
};
