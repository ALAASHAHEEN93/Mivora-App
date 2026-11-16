import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { locales } from "./routing";
import { messageKeys } from "./merge";

const load = (l: string) => JSON.parse(readFileSync(path.join(__dirname, "../../messages", `${l}.json`), "utf8"));
const deKeys = messageKeys(load("de")).sort();
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)[,}]/g)].map((m) => m[1]).sort();

describe("translations", () => {
  it.each(locales.filter((l) => l !== "de"))("%s has exactly the German keys", (l) => {
    expect(messageKeys(load(l)).sort()).toEqual(deKeys);
  });

  it.each(locales.filter((l) => l !== "de"))("%s keeps the same placeholders", (l) => {
    const de = load("de");
    const other = load(l);
    for (const key of deKeys) {
      const get = (tree: Record<string, unknown>) => key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], tree) as string;
      expect(placeholders(get(other)), `${l}:${key}`).toEqual(placeholders(get(de)));
    }
  });
});
