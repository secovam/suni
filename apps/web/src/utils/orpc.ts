import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouterClient } from "@suni/api/routers/index";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ENV } from "../env";

function getServerUrl(url: string) {
  // SAFETY: server-side runtimes expose process.env on globalThis when SERVER_URL is available.
  const processEnv = (
    globalThis as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env;

  if (typeof window === "undefined" && processEnv?.SERVER_URL) {
    return processEnv.SERVER_URL.endsWith("/")
      ? processEnv.SERVER_URL.slice(0, -1)
      : processEnv.SERVER_URL;
  }

  return url.endsWith("/") ? url.slice(0, -1) : url;
}

const link = new RPCLink({
  url: `${getServerUrl(ENV.VITE_SERVER_URL)}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);

function createQueryClient() {
  const queryClient = new QueryClient({
    // Every successful mutation refetches the mounted queries, so no hook lists which entities it touches.
    mutationCache: new MutationCache({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.key() }),
    }),
    queryCache: new QueryCache({
      onError: (error, query) => {
        toast.error(`Error: ${error.message}`, {
          action: {
            label: "Reintentar",
            onClick: () => {
              query.invalidate();
            },
          },
        });
      },
    }),
  });

  return queryClient;
}

export const queryClient = createQueryClient();
