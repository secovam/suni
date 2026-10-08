import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import type { Database } from "@suni/db";
// oxlint-disable-next-line sonarjs/no-wildcard-import
import * as schema from "@suni/db/schema/auth";
import { betterAuth } from "better-auth";
import { admin, magicLink } from "better-auth/plugins";
import { eq } from "drizzle-orm";

const SECONDS_PER_MINUTE = 60;

const SECONDS_PER_DAY = 60 * 60 * 24;

const SESSION_EXPIRES_IN_DAYS = 30;

const COOKIE_CACHE_MINUTES = 5;

const MAGIC_LINK_EXPIRES_IN_SECONDS = 900;

export interface AuthConfig {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  CORS_ORIGIN: string;
  NODE_ENV?: "development" | "production" | "test";
  sendMagicLink: (params: {
    email: string;
    url: string;
    expiresIn: string;
  }) => Promise<void>;
}

async function userExists(database: Database, email: string): Promise<boolean> {
  const [existingUser] = await database
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(eq(schema.user.email, email))
    .limit(1);

  return existingUser !== undefined;
}

export function createAuth(
  env: AuthConfig,
  database: Database,
  desktopOrigins: readonly string[] = []
) {
  const isProduction = env.NODE_ENV === "production";

  return betterAuth({
    advanced: {
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
      },
    },
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(database, {
      provider: "pg",
      schema,
    }),
    plugins: [
      admin(),
      magicLink({
        disableSignUp: true,
        expiresIn: MAGIC_LINK_EXPIRES_IN_SECONDS,
        sendMagicLink: async ({ email, url }) => {
          const normalizedEmail = email.trim().toLowerCase();

          if (await userExists(database, normalizedEmail)) {
            await env.sendMagicLink({
              email: normalizedEmail,
              expiresIn: "15 minutos",
              url,
            });
          }
        },
      }),
    ],
    rateLimit: {
      customRules: {
        "/sign-in/magic-link": {
          max: 3,
          window: 60,
        },
      },
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    session: {
      cookieCache: {
        enabled: true,
        maxAge: COOKIE_CACHE_MINUTES * SECONDS_PER_MINUTE,
      },
      expiresIn: SECONDS_PER_DAY * SESSION_EXPIRES_IN_DAYS,
      updateAge: SECONDS_PER_DAY,
    },
    trustedOrigins: [env.CORS_ORIGIN, ...desktopOrigins],
  });
}

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
