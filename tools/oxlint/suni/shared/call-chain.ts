import type { ESTree } from "@oxlint/plugins";

/** Names of the methods chained onto `start`: `z.string().trim().max(5)` gives `["trim", "max"]`. */
export function chainedMethods(start: ESTree.Node): string[] {
  const methods: string[] = [];
  let current: ESTree.Node = start;

  while (
    current.parent?.type === "MemberExpression" &&
    current.parent.object === current &&
    current.parent.property.type === "Identifier" &&
    current.parent.parent?.type === "CallExpression" &&
    current.parent.parent.callee === current.parent
  ) {
    methods.push(current.parent.property.name);
    current = current.parent.parent;
  }

  return methods;
}
