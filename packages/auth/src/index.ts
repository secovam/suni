import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import type { Database } from "@suni/db";
import { account, session, user, verification } from "@suni/db/schema/auth";
import { betterAuth } from "better-auth";
import { admin, magicLink } from "better-auth/plugins";

const schema = { account, session, user, verification };

const SECONDS_PER_MINUTE = 60;

const SECONDS_PER_DAY = 60 * 60 * 24;

const SESSION_EXPIRES_IN_DAYS = 30;

const COOKIE_CACHE_MINUTES = 5;

const MAGIC_LINK_EXPIRES_IN_SECONDS = 900;

export interface SendMagicLinkParams {
  email: string;
  url: string;
  expiresIn: string;
}

export interface AuthConfig {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  CORS_ORIGIN: string;
  NODE_ENV?: "development" | "production" | "test";
  sendMagicLink: (params: SendMagicLinkParams) => Promise<void>;
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
          await env.sendMagicLink({
            email,
            expiresIn: "15 minutos",
            url,
          });
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

export type Auth = ReturnType<typeof createAuth>;

export type Session = Auth["$Infer"]["Session"];
