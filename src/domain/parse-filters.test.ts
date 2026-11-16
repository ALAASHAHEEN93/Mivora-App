import { describe, expect, it } from "vitest";
import { countActiveFilters, parseFilters } from "./parse-filters";

describe("parseFilters", () => {
  it("parses valid params", () => {
    expect(
      parseFilters({ q: " yoga ", datum: "weekend", alter: "6", preis: "10", sprache: "ar", ort: "indoor", barrierefrei: "wheelchair", kategorie: "stem" }),
    ).toEqual({
      day: undefined,
      q: "yoga",
      date: "weekend",
      age: 6,
      district: undefined,
      category: "stem",
      maxPriceCents: 1000,
      language: "ar",
      setting: "indoor",
      accessibility: "wheelchair",
    });
  });

  it("drops invalid or hostile values", () => {
    const f = parseFilters({ alter: "99", preis: "-1", datum: "yesterday", sprache: "xx", kategorie: "<script>", ort: "both", q: "x".repeat(500) });
    expect(f.age).toBeUndefined();
    expect(f.maxPriceCents).toBeUndefined();
    expect(f.date).toBeUndefined();
    expect(f.language).toBeUndefined();
    expect(f.category).toBeUndefined();
    expect(f.setting).toBeUndefined();
    expect(f.q).toBeUndefined();
  });

  it("accepts a single ISO day and rejects junk", () => {
    expect(parseFilters({ datum: "2026-11-21" }).day).toBe("2026-11-21");
    expect(parseFilters({ datum: "2026-13-45" }).day).toBeUndefined();
    expect(parseFilters({ datum: "21.11.2026" }).day).toBeUndefined();
  });

  it("free = preis 0", () => {
    expect(parseFilters({ preis: "0" }).maxPriceCents).toBe(0);
  });

  it("counts active filters except search text", () => {
    expect(countActiveFilters(parseFilters({ q: "a", alter: "5", preis: "0" }))).toBe(2);
  });
});
