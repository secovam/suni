import type { ImportSpec } from "./scope.ts";

const ROUTER_MODULE = /^@tanstack\/react-router$/u;

/** A hook (or function) imported from TanStack Router, whatever alias it has locally. */
export function fromRouter(name: string): ImportSpec {
  return { source: ROUTER_MODULE, name: new RegExp(`^(?:${name})$`, "u") };
}

/** What builds a route API or Route object, the receiver of `.useSearch()` and `.useNavigate()`. */
export const ROUTE_OBJECT = fromRouter(
  "getRouteApi|createFileRoute|createRoute|createRootRoute|createRootRouteWithContext|createLazyFileRoute|createLazyRoute"
);
