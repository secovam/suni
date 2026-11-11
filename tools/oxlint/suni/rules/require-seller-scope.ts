import { defineRule, type ESTree } from "@oxlint/plugins";

// Tables whose rows carry the seller; see sellerColumns in packages/api/src/util/scope.ts.
const SELLER_TABLES = new Set(["customer", "branch"]);
const QUERY_METHODS = new Set(["findFirst", "findMany"]);
const ADMIN_ONLY_COLUMNS = new Set(["sellerId", "modifiedBy"]);

function propertyName(node: ESTree.Node): string | undefined {
  if (node.type === "Identifier") return node.name;
  if (node.type === "Literal" && typeof node.value === "string")
    return node.value;
  return undefined;
}

function findProperty(object: ESTree.ObjectExpression, name: string) {
  return object.properties.find(
    (property): property is ESTree.ObjectProperty =>
      property.type === "Property" && propertyName(property.key) === name
  );
}

function isCallTo(node: ESTree.Node, name: string) {
  return (
    node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    node.callee.name === name
  );
}

// An explicit allowlist (`{ id: true, name: true }`) never selects columns it does not name.
function isSafeAllowlist(node: ESTree.Node) {
  return (
    node.type === "ObjectExpression" &&
    node.properties.every(
      (property) =>
        property.type === "Property" &&
        !property.computed &&
        property.value.type === "Literal" &&
        property.value.value === true &&
        !ADMIN_ONLY_COLUMNS.has(propertyName(property.key) ?? "")
    )
  );
}

// Matches `<anything>.query.<table>.<method>(...)`.
function sellerTableQuery(callee: ESTree.Node) {
  if (
    callee.type !== "MemberExpression" ||
    !QUERY_METHODS.has(propertyName(callee.property) ?? "")
  )
    return undefined;
  const table = callee.object;
  if (
    table.type !== "MemberExpression" ||
    table.object.type !== "MemberExpression" ||
    propertyName(table.object.property) !== "query"
  )
    return undefined;
  const name = propertyName(table.property);
  return name && SELLER_TABLES.has(name) ? name : undefined;
}

export default defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Require customer and branch queries to hide seller identity from non-admins.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const table = sellerTableQuery(node.callee);
        if (!table) return;

        const [config] = node.arguments;
        const columns =
          config?.type === "ObjectExpression"
            ? findProperty(config, "columns")?.value
            : undefined;

        if (
          !columns ||
          !(isCallTo(columns, "sellerColumns") || isSafeAllowlist(columns))
        ) {
          context.report({
            node,
            message: `Seller identity is admin-only: pass \`columns: sellerColumns(context)\` to this ${table} query, or list only the columns you need with \`true\`.`,
          });
        }

        const relations =
          config?.type === "ObjectExpression"
            ? findProperty(config, "with")?.value
            : undefined;
        const seller =
          relations?.type === "ObjectExpression"
            ? findProperty(relations, "seller")
            : undefined;

        if (seller) {
          context.report({
            node: seller,
            message:
              "Seller identity is admin-only: spread `...sellerRelation(context)` instead of loading `seller` directly.",
          });
        }
      },
    };
  },
});
