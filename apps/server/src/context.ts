import type { Context as ApiContext } from "@suni/api/context";
import type { Context as HonoContext } from "hono";

import { auth, db } from "./services";

export interface CreateContextOptions {
  context: HonoContext;
}

export async function createContext({
  context,
}: CreateContextOptions): Promise<ApiContext> {
  const { headers } = context.req.raw;
  const session = await auth.api.getSession({ headers });

  return {
    auth,
    db,
    headers,
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
