import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/** WCAG 2.x contrast ratio between two hex colours. */
function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const css = readFileSync(path.join(__dirname, "../app/globals.css"), "utf8");
function tokens(block: string): Record<string, string> {
  return Object.fromEntries([...block.matchAll(/--kw-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1]!, m[2]!]));
}
const light = tokens(css.split("@media (prefers-color-scheme: dark)")[0]!);
const dark = { ...light, ...tokens(css.split("@media (prefers-color-scheme: dark)")[1]!.split("@theme")[0]!) };

// [foreground, background] pairs actually used for text in the UI.
const PAIRS: [string, string][] = [
  ["ink", "bg"],
  ["ink", "surface"],
  ["muted", "bg"],
  ["muted", "surface"],
  ["on-primary", "primary"],
  ["accent", "bg"],
  ["accent", "surface"],
  ["accent", "coral-100"],
  ["ink", "coral-100"],
  ["ink", "sun-100"],
  ["ink", "teal-100"],
  ["ink", "lav-100"],
  ["muted", "coral-100"],
  ["teal-700", "surface"],
];

describe("colour contrast (WCAG AA, 4.5:1 for body text)", () => {
  for (const [name, theme] of [["light", light], ["dark", dark]] as const) {
    it.each(PAIRS)(`${name}: %s on %s`, (fg, bg) => {
      expect(contrast(theme[fg]!, theme[bg]!)).toBeGreaterThanOrEqual(4.5);
    });
  }
  it("palette pills (aqua, gold) always use fixed navy text", () => {
    for (const bg of ["#ffb3ba", "#f8b400", "#d4a5a5", light["coral-500"]!]) expect(contrast("#392f5a", bg)).toBeGreaterThanOrEqual(4.5);
  });
  it("child colours carry navy text", async () => {
    const { CHILD_COLORS } = await import("./children");
    for (const bg of CHILD_COLORS) expect(contrast("#392f5a", bg)).toBeGreaterThanOrEqual(4.5);
  });
  it("demo banner: ink on sunshine", () => {
    expect(contrast("#392f5a", light["sun-400"]!)).toBeGreaterThanOrEqual(4.5);
  });
});
