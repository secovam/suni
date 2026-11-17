import { defineRule, type ESTree } from "@oxlint/plugins";

import {
  derivesFromImport,
  isImportOf,
  type ImportSpec,
} from "../shared/scope.ts";
import { fromRouter, ROUTE_OBJECT } from "../shared/tanstack-router.ts";

// oRPC query and mutation hooks live in `hooks/use-<module>.ts` and are named after what they call on the
// router (`useListCustomers`, `useCreateUser`, `useChangeUserStatus`). Other hooks there (`useIsAdmin`,
// `useAddressLookup`) return plain values and have no router type to use.
const ROUTER_HOOK: ImportSpec = {
  source: /(?:^|\/)hooks\/use-[^/]+$/u,
  name: /^use(?:List|Get|Create|Update|Archive|Change)[A-Z]/u,
};
// Route hooks whose return is the route's search, params or loader data.
const ROUTE_DATA_HOOKS = "useSearch|useLoaderData|useParams";
const ROUTE_DATA_HOOK = fromRouter(ROUTE_DATA_HOOKS);
const ROUTE_DATA_MEMBER = new RegExp(`^(?:${ROUTE_DATA_HOOKS})$`, "u");

function rootOfIndexedAccess(type: ESTree.Node): ESTree.Node {
  let current = type;
  while (current.type === "TSIndexedAccessType") current = current.objectType;
  return current;
}

export default defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Type router inputs and outputs with AppRouterInputs / AppRouterOutputs.",
    },
  },
  create(context) {
    const isRouterDataHook = (name: ESTree.TSTypeQuery["exprName"]) => {
      const { sourceCode } = context;

      if (name.type === "Identifier")
        return (
          isImportOf(sourceCode, name, ROUTER_HOOK) ||
          isImportOf(sourceCode, name, ROUTE_DATA_HOOK)
        );

      // `Route.useSearch`: only when `Route` is a route API or a route built by TanStack Router.
      return (
        name.type === "TSQualifiedName" &&
        name.left.type === "Identifier" &&
        ROUTE_DATA_MEMBER.test(name.right.name) &&
        derivesFromImport(sourceCode, name.left, ROUTE_OBJECT)
      );
    };

    return {
      TSTypeReference(node) {
        if (node.typeName.type !== "Identifier") return;

        const [argument] = node.typeArguments?.params ?? [];
        if (!argument) return;

        const { name } = node.typeName;
        const root = rootOfIndexedAccess(argument);

        if (
          name === "Parameters" &&
          root.type === "TSTypeReference" &&
          root.typeName.type === "Identifier" &&
          root.typeName.name === "AppRouterClient"
        ) {
          context.report({
            node,
            message:
              "Use `AppRouterInputs[...]` from `@suni/api/routers/index` instead of `Parameters<AppRouterClient...>`.",
          });
        }

        if (
          name === "ReturnType" &&
          argument.type === "TSTypeQuery" &&
          isRouterDataHook(argument.exprName)
        ) {
          context.report({
            node,
            message:
              "Use `AppRouterOutputs[...]` from `@suni/api/routers/index` (or the route's own types) instead of `ReturnType<typeof use...>` on a router hook.",
          });
        }
      },
    };
  },
});
