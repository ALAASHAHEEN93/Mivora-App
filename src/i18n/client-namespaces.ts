/**
 * Message groups that interactive (client) components use. Only these are sent to the
 * phone; everything else stays on the server. A test checks client files against this list.
 */
export const CLIENT_NAMESPACES = [
  "common",
  "nav",
  "categories",
  "setting",
  "access",
  "activity",
  "calendar",
  "family",
  "explore",
  "provider",
  "saved",
  "system",
] as const;

type Tree = Record<string, unknown>;
export function pickNamespaces(messages: Tree, namespaces: readonly string[] = CLIENT_NAMESPACES): Tree {
  return Object.fromEntries(namespaces.filter((n) => n in messages).map((n) => [n, messages[n]]));
}
