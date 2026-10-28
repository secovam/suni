import { defineRelations, defineRelationsPart } from "drizzle-orm";

import {
  account,
  authRelations,
  session,
  user,
  verification,
} from "./schema/auth";
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

export const relations = {
  ...defineRelations({ account, session, user, verification, customer }),
  ...authRelations,
  ...customerRelations,
};
