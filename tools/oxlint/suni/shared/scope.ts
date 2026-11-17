import type { ESTree, Scope, SourceCode, Variable } from "@oxlint/plugins";

type Identifier = Extract<ESTree.Node, { type: "Identifier" }>;

/** Resolve an identifier to its binding by walking lexical scopes upward. */
function resolveVariable(
  sourceCode: SourceCode,
  identifier: Identifier
): Variable | null {
  let scope: Scope | null = sourceCode.getScope(identifier);

  while (scope !== null) {
    const variable = scope.set.get(identifier.name);
    if (variable !== undefined) return variable;
    scope = scope.upper;
  }

  return null;
}

interface ImportBinding {
  source: string;
  /** Imported name; `default` for a default import, `*` for a namespace import. */
  name: string;
}

function importBindingOf(variable: Variable): ImportBinding | null {
  const [definition] = variable.defs;

  if (
    definition?.type !== "ImportBinding" ||
    definition.parent?.type !== "ImportDeclaration"
  )
    return null;

  const { node } = definition;
  const source = definition.parent.source.value;

  if (node.type === "ImportNamespaceSpecifier") return { source, name: "*" };
  if (node.type === "ImportDefaultSpecifier")
    return { source, name: "default" };
  if (node.type !== "ImportSpecifier") return null;

  const { imported } = node;
  return {
    source,
    name:
      imported.type === "Identifier" ? imported.name : String(imported.value),
  };
}

/** What an import must look like: the module, and optionally the imported name (the local alias never matters). */
export interface ImportSpec {
  source: RegExp;
  name?: RegExp;
}

function matchesSpec(binding: ImportBinding, spec: ImportSpec) {
  return (
    spec.source.test(binding.source) &&
    (!spec.name || (binding.name !== "*" && spec.name.test(binding.name)))
  );
}

/** True when `identifier` resolves to an import matching `spec`, whatever local name it has. */
export function isImportOf(
  sourceCode: SourceCode,
  identifier: Identifier,
  spec: ImportSpec
): boolean {
  const variable = resolveVariable(sourceCode, identifier);
  const binding = variable && importBindingOf(variable);

  return !!binding && matchesSpec(binding, spec);
}

/** Initializer of a `const x = <init>` binding, or `null` for any other kind of binding. */
function initializerOf(variable: Variable): ESTree.Expression | null {
  const [definition] = variable.defs;

  if (
    definition?.type === "Variable" &&
    definition.node.type === "VariableDeclarator" &&
    definition.node.id.type === "Identifier"
  )
    return definition.node.init;

  return null;
}

/** Leftmost identifier of `a.b.c(...).d`, or `null` when the chain starts elsewhere (`new X()`, a literal). */
function rootIdentifier(node: ESTree.Node): Identifier | null {
  let current = node;

  while (
    current.type === "MemberExpression" ||
    current.type === "CallExpression"
  )
    current =
      current.type === "MemberExpression" ? current.object : current.callee;

  return current.type === "Identifier" ? current : null;
}

/**
 * True when the leftmost identifier of `node` is an import matching `spec`, or a binding initialized
 * from such a chain: `z.object()` after `import { z } from "zod"`, `Route` after `Route = createFileRoute()()`.
 */
export function derivesFromImport(
  sourceCode: SourceCode,
  node: ESTree.Node,
  spec: ImportSpec,
  seen = new Set<Variable>()
): boolean {
  const root = rootIdentifier(node);
  const variable = root && resolveVariable(sourceCode, root);
  if (!variable || seen.has(variable)) return false;
  seen.add(variable);

  const binding = importBindingOf(variable);
  if (binding) return matchesSpec(binding, spec);

  const init = initializerOf(variable);
  return !!init && derivesFromImport(sourceCode, init, spec, seen);
}
