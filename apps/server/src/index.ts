import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ORPCError, onError, ValidationError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { appRouter } from "@suni/api/routers/index";
import { initLogger } from "evlog";
import { createAuthMiddleware } from "evlog/better-auth";
import type { BetterAuthInstance } from "evlog/better-auth";
import { createFsDrain } from "evlog/fs";
import { evlog } from "evlog/hono";
import type { EvlogVariables } from "evlog/hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";

import { createContext } from "./context";
import { ENV } from "./env.server";
import { auth } from "./services";

initLogger({
  env: { service: "suni-server" },
});

// SAFETY: auth is created by Better Auth and implements the evlog BetterAuthInstance contract.
const identifyUser = createAuthMiddleware(auth as BetterAuthInstance, {
  exclude: ["/api/auth/**"],
  maskEmail: true,
});

const app = new Hono<EvlogVariables>();

function handleError<T>(error: T) {
  console.error(error);
}

// Default Zod messages (e.g. a missing field) in Spanish; schemas keep their own messages.
z.config(z.locales.es());

// oRPC answers failed input validation with a generic English message; send the schema's own message instead.
async function schemaErrorMessage<T>({ next }: { next: () => Promise<T> }) {
  try {
    return await next();
  } catch (error) {
    if (
      error instanceof ORPCError &&
      error.code === "BAD_REQUEST" &&
      error.cause instanceof ValidationError
    ) {
      throw new ORPCError("BAD_REQUEST", {
        message: error.cause.issues[0]?.message ?? error.message,
        data: error.data,
        cause: error.cause,
      });
    }

    throw error;
  }
}

app.use(
  evlog(process.env.NODE_ENV === "production" ? {} : { drain: createFsDrain() })
);

app.use("*", async (c, next) => {
  await identifyUser(c.get("log"), c.req.raw.headers, c.req.path);

  return next();
});

app.use(
  "/*",
  cors({
    origin: ENV.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [onError(handleError)],
  clientInterceptors: [schemaErrorMessage],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [onError(handleError)],
  clientInterceptors: [schemaErrorMessage],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  return next();
});

app.get("/", (c) => c.text("OK"));

// Portless passes HOST=127.0.0.1. Bun ignores it by default and listens on every interface, sharing the port with any other local app on 127.0.0.1.
export default { fetch: app.fetch, hostname: process.env.HOST };
