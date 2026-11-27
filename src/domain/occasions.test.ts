import { describe, expect, it } from "vitest";
import { dueOccasions, easterSunday, occasionsForYear } from "./occasions";

describe("easterSunday", () => {
  it.each([
    [2024, "2024-03-31"],
    [2025, "2025-04-20"],
    [2026, "2026-04-05"],
    [2027, "2027-03-28"],
    [2038, "2038-04-25"],
  ])("%i → %s", (year, date) => {
    expect(easterSunday(year)).toBe(date);
  });
});

describe("occasionsForYear", () => {
  it("puts Köln carnival from Weiberfastnacht (Thursday) to Rosenmontag", () => {
    const carnival = occasionsForYear(2027).find((o) => o.id === "carnival")!;
    expect(carnival).toMatchObject({ from: "2027-02-04", to: "2027-02-08", key: "carnival:2027-02-04" });
  });

  it("is sorted by start date and only adds school breaks that start in that year", () => {
    const breaks = [
      { id: "christmasBreak" as const, from: "2026-12-21", to: "2027-01-05" },
      { id: "summerBreak" as const, from: "2027-07-01", to: "2027-08-10" },
    ];
    const list = occasionsForYear(2026, breaks);
    expect(list.map((o) => o.from)).toEqual([...list.map((o) => o.from)].sort());
    expect(list.some((o) => o.id === "christmasBreak")).toBe(true);
    expect(list.some((o) => o.id === "summerBreak")).toBe(false);
  });
});

describe("dueOccasions", () => {
  it("announces an occasion during the 7 days before it starts", () => {
    expect(dueOccasions("2026-12-10").map((o) => o.id)).toEqual([]);
    expect(dueOccasions("2026-12-11").map((o) => o.id)).toEqual(["christmas"]);
    expect(dueOccasions("2026-12-17").map((o) => o.id)).toEqual(["christmas"]);
    expect(dueOccasions("2026-12-18").map((o) => o.id)).toEqual([]);
  });

  it("looks into the next year at the turn of the year", () => {
    const breaks = [{ id: "christmasBreak" as const, from: "2027-01-02", to: "2027-01-06" }];
    expect(dueOccasions("2026-12-30", breaks).map((o) => o.key)).toEqual(["christmasBreak:2027-01-02"]);
  });
});
