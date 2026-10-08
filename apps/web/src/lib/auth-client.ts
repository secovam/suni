import { adminClient, magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { ENV } from "../env";

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function getServerUrl(url: string): string {
  // SAFETY: Accessing process.env via globalThis prevents runtime errors in browser environments while safely reading environment variables on the server.
  const processEnv = (
    globalThis as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env;

  if (typeof window === "undefined" && processEnv?.SERVER_URL) {
    return trimTrailingSlash(processEnv.SERVER_URL);
  }

  const normalized = trimTrailingSlash(url);

  if (!normalized.startsWith("/")) {
    return normalized;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}${normalized}`;
  }

  return `http://localhost:4000${normalized}`;
}

export const authClient = createAuthClient({
  baseURL: new URL("/api/auth", getServerUrl(ENV.VITE_SERVER_URL)).toString(),
  plugins: [adminClient(), magicLinkClient()],
});

export type AuthUser = typeof authClient.$Infer.Session.user;
