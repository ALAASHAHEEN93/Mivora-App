import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { CLIENT_NAMESPACES, pickNamespaces } from "./client-namespaces";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

describe("texts sent to the phone", () => {
  const clientFiles = files(path.join(__dirname, "..")).filter((f) => readFileSync(f, "utf8").includes('"use client"'));

  it("every namespace used by a client component is sent", () => {
    for (const f of clientFiles) {
      const src = readFileSync(f, "utf8");
      for (const m of src.matchAll(/useTranslations\("([a-zA-Z]+)"\)/g)) expect(CLIENT_NAMESPACES, f).toContain(m[1]);
      // root translator: t("namespace.key")
      if (/useTranslations\(\)/.test(src)) {
        for (const m of src.matchAll(/\bt\("([a-zA-Z]+)\./g)) expect(CLIENT_NAMESPACES, f).toContain(m[1]);
        for (const m of src.matchAll(/\bt\(`([a-zA-Z]+)\./g)) expect(CLIENT_NAMESPACES, f).toContain(m[1]);
      }
    }
  });

  it("drops server-only groups", () => {
    const picked = pickNamespaces({ common: { a: "1" }, email: { b: "2" }, auth: { c: "3" } });
    expect(Object.keys(picked)).toEqual(["common"]);
  });
});
