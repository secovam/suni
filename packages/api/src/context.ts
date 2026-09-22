import type { Session } from "@suni/auth";
import type { Database } from "@suni/db";

export interface Context {
  session: Session | null;
  db: Database;
}
