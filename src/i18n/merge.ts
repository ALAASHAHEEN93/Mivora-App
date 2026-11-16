type Tree = { [key: string]: string | Tree };

/** Deep-merge `override` onto `base` (used for German fallback of missing translation keys). */
export function mergeMessages(base: Tree, override: Tree): Tree {
  const out: Tree = { ...base };
  for (const [k, v] of Object.entries(override)) {
    const b = base[k];
    out[k] = typeof v === "object" && typeof b === "object" ? mergeMessages(b, v) : v;
  }
  return out;
}

/** Flattened list of message keys, e.g. "nav.home". */
export function messageKeys(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([k, v]) =>
    typeof v === "object" ? messageKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}
