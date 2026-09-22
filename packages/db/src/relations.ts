import { defineRelations } from "drizzle-orm";

import {
  account,
  authRelations,
  session,
  user,
  verification,
} from "./schema/auth";

export const relations = {
  ...defineRelations({ account, session, user, verification }),
  ...authRelations,
};
