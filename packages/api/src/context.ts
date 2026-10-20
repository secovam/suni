import type { Auth, Session } from "@suni/auth";
import type { Database } from "@suni/db";

export interface Context {
  auth: Auth;
  db: Database;
  headers: Headers;
  session: Session | null;
}
