import { useRouteContext } from "@tanstack/react-router";

export function useIsAdmin() {
  return useRouteContext({
    from: "/_auth",
    select: (ctx) => ctx.session.user.role === "admin",
  });
}
