import { describe, expect, it } from "vitest";
import { CITIES, cityName, citiesForLocale, findCity } from "./cities";

describe("cities", () => {
  it("has unique slugs and only Köln live", () => {
    expect(new Set(CITIES.map((c) => c.slug)).size).toBe(CITIES.length);
    expect(CITIES.filter((c) => c.live).map((c) => c.slug)).toEqual(["koeln"]);
  });
  it("localizes names with German fallback", () => {
    expect(cityName("koeln", "en")).toBe("Cologne");
    expect(cityName("koeln", "ar")).toBe("كولونيا");
    expect(cityName("bonn", "fr")).toBe("Bonn");
  });
  it("rejects unknown slugs", () => {
    expect(findCity("atlantis")).toBeNull();
    expect(findCity(undefined)).toBeNull();
  });
  it("sorts in the UI language", () => {
    expect(citiesForLocale("de")[0]!.name).toBe("Berlin");
  });
});
