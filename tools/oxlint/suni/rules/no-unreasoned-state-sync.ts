// Ported from t3code (MIT, T3 Tools Inc.): oxlint-plugin-t3code/rules/no-unreasoned-state-sync.ts
import { defineRule, type ESTree } from "@oxlint/plugins";

const EFFECT_HOOKS = new Set([
  "useEffect",
  "useLayoutEffect",
  "useInsertionEffect",
]);
const EFFECT_HOOK_TEXT = /use(?:Layout|Insertion)?Effect/u;
const TEST_FILE =
  /\.(?:test|spec)\.[cm]?[jt]sx?$|[\\/](?:tests?|__tests__|e2e)[\\/]/u;

const isEffectHookCall = (node: ESTree.CallExpression) => {
  const { callee } = node;
  if (callee.type === "Identifier") return EFFECT_HOOKS.has(callee.name);
  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property.type === "Identifier" &&
    EFFECT_HOOKS.has(callee.property.name)
  );
};

// Agents read this message and act on it, so it walks the alternatives before it shows the way out.
const MESSAGE =
  "Stop and reconsider before keeping this effect. " +
  "Is it computable from props or state? Compute it during render; the compiler memoizes it. " +
  "Does it respond to a user action? Do it in that handler. " +
  "Does it reset state when a prop changes? Key the component on that prop. " +
  "Does it tell a parent that a value changed? Do it where the change happens. " +
  "Does it load server data? Use an oRPC query hook from apps/web/src/hooks. " +
  "Does it read a value from outside React? Use useSyncExternalStore. " +
  "An effect that sets state another effect reads is one handler or one derivation. " +
  "An effect is right only when it keeps something outside React in step with this component while mounted: " +
  "a DOM node, listener, timer, connection, router, or imperative toast. " +
  "Moving the same logic into a ref to dodge this rule is not a fix. " +
  "If the effect does that, name what it keeps in step on the line above: " +
  "`// oxlint-disable-next-line suni/no-unreasoned-state-sync -- <what it syncs with and why>`.";

// Every kept effect carries its reason in the suppression above it; suni/require-suppression-reason
// rejects a suppression that does not say why.
export default defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Report every React effect hook, the usual way state gets synchronized; one that stays says why.",
    },
  },
  create(context) {
    if (
      TEST_FILE.test(context.filename) ||
      !EFFECT_HOOK_TEXT.test(context.sourceCode.text)
    ) {
      return {};
    }
    return {
      CallExpression(node) {
        if (isEffectHookCall(node)) context.report({ node, message: MESSAGE });
      },
    };
  },
});
