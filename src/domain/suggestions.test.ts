import { describe, expect, it } from "vitest";
import { buildDemoActivities } from "@/data/demo-activities";
import { searchActivities } from "./filters";
import { possibleAges, suggestForChild } from "./suggestions";

const now = new Date("2026-11-17T12:00:00Z");
const all = searchActivities(buildDemoActivities(now), {}, now);

describe("age-based suggestions", () => {
  it("a birth year means one of two ages", () => {
    expect(possibleAges(2020, now)).toEqual([5, 6]);
    expect(possibleAges(2026, now)).toEqual([0, 0]);
  });

  it("only suggests activities whose age range fits", () => {
    const res = suggestForChild(all, { birthYear: 2020, interests: [] }, now, 50);
    expect(res.length).toBeGreaterThan(0);
    for (const r of res) {
      expect(r.activity.ageMin).toBeLessThanOrEqual(6);
      expect(r.activity.ageMax).toBeGreaterThanOrEqual(5);
    }
    // teen hip-hop (12–17) must not be suggested to a 5–6 year old
    expect(res.some((r) => r.activity.slug === "hip-hop-teens-muelheim")).toBe(false);
  });

  it("puts the child's interests first", () => {
    const res = suggestForChild(all, { birthYear: 2020, interests: ["theatre"] }, now);
    expect(res[0]!.activity.categories).toContain("theatre");
  });

  it("babies get baby offers", () => {
    const res = suggestForChild(all, { birthYear: 2026, interests: [] }, now);
    expect(res.map((r) => r.activity.slug)).toContain("krabbelgruppe-nippes");
    for (const r of res) expect(r.activity.ageMin).toBe(0);
  });
});
