import { describe, expect, it } from "vitest";
import { distanceKm, sortByDistance } from "./geo";

const dom = { lat: 50.9413, lng: 6.9583 }; // Köln cathedral area
describe("distances", () => {
  it("is about right inside Köln", () => {
    const ehrenfeld = { lat: 50.9497, lng: 6.9133 };
    expect(distanceKm(dom, ehrenfeld)).toBeGreaterThan(3);
    expect(distanceKm(dom, ehrenfeld)).toBeLessThan(4);
    expect(distanceKm(dom, dom)).toBe(0);
  });
  it("sorts nearest first", () => {
    const places = [{ n: "porz", lat: 50.8794, lng: 7.0559 }, { n: "altstadt", lat: 50.9413, lng: 6.9583 }, { n: "kalk", lat: 50.9406, lng: 7.0001 }];
    expect(sortByDistance(places, dom, (p) => p).map((x) => x.item.n)).toEqual(["altstadt", "kalk", "porz"]);
  });
});
