import { describe, expect, it } from "vitest";
import { buildDemoActivities } from "@/data/demo-activities";
import { searchActivities, upcomingSessions } from "./filters";
import { berlinDate, dateRange, weekday } from "./time";

// A Wednesday at 12:00 Berlin time (winter, UTC+1).
const NOW = new Date("2026-11-18T11:00:00Z");
const data = buildDemoActivities(NOW);
const slugs = (r: ReturnType<typeof searchActivities>) => r.map((x) => x.activity.slug);

describe("freshness rules", () => {
  it("never shows expired or draft listings", () => {
    const all = slugs(searchActivities(data, {}, NOW));
    expect(all).not.toContain("abgelaufenes-sommerfest");
    expect(all).not.toContain("entwurf-malkurs");
    expect(all.length).toBe(13);
  });

  it("drops past and cancelled sessions", () => {
    const a = structuredClone(data[0]!);
    a.sessions = [
      { id: "past", startsAt: "2026-11-17T09:00:00+01:00", endsAt: "2026-11-17T10:00:00+01:00", status: "scheduled" },
      { id: "cxl", startsAt: "2026-11-20T09:00:00+01:00", endsAt: "2026-11-20T10:00:00+01:00", status: "cancelled" },
      { id: "ok", startsAt: "2026-11-21T09:00:00+01:00", endsAt: "2026-11-21T10:00:00+01:00", status: "scheduled" },
    ];
    expect(upcomingSessions(a, NOW).map((s) => s.id)).toEqual(["ok"]);
  });

  it("hides a listing whose only session is over", () => {
    const a = structuredClone(data[0]!);
    a.sessions = [{ id: "past", startsAt: "2026-11-18T09:00:00+01:00", endsAt: "2026-11-18T10:00:00+01:00", status: "scheduled" }];
    expect(searchActivities([a], {}, NOW)).toHaveLength(0);
  });
});

describe("filters", () => {
  it("filters by child age inclusively", () => {
    const res = searchActivities(data, { age: 2 }, NOW);
    expect(res.length).toBeGreaterThan(0);
    for (const r of res) {
      expect(r.activity.ageMin).toBeLessThanOrEqual(2);
      expect(r.activity.ageMax).toBeGreaterThanOrEqual(2);
    }
  });

  it("free only = maxPrice 0", () => {
    const res = searchActivities(data, { maxPriceCents: 0 }, NOW);
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((r) => r.activity.price.kind === "free")).toBe(true);
  });

  it("weekend only returns sessions on Saturday/Sunday", () => {
    const res = searchActivities(data, { date: "weekend" }, NOW);
    expect(res.length).toBeGreaterThan(0);
    for (const r of res) for (const s of r.sessions) expect([0, 6]).toContain(weekday(berlinDate(new Date(s.startsAt))));
  });

  it("single day returns only sessions on that Berlin date", () => {
    const res = searchActivities(data, { day: "2026-11-21" }, NOW);
    expect(res.length).toBeGreaterThan(0);
    for (const r of res) for (const s of r.sessions) expect(berlinDate(new Date(s.startsAt))).toBe("2026-11-21");
  });

  it("matches text across languages and provider name", () => {
    expect(slugs(searchActivities(data, { q: "robotik" }, NOW))).toEqual(["robotik-werkstatt"]);
    expect(slugs(searchActivities(data, { q: "okuma" }, NOW))).toEqual(["mehrsprachige-vorlesestunde"]);
  });

  it("outdoor filter keeps 'both' listings", () => {
    const res = slugs(searchActivities(data, { setting: "outdoor" }, NOW));
    expect(res).toContain("naturforscher-stadtwald");
    expect(res).toContain("ferien-camp-sport-spiel");
    expect(res).not.toContain("toepfern-fuer-kids");
  });

  it("sorts by next session", () => {
    const res = searchActivities(data, {}, NOW);
    const starts = res.map((r) => r.sessions[0]!.startsAt);
    expect([...starts].sort()).toEqual(starts);
  });
});

describe("date ranges (Europe/Berlin)", () => {
  it("weekend from a weekday is the coming Sat–Sun", () => {
    expect(dateRange("weekend", NOW)).toEqual({ from: "2026-11-21", to: "2026-11-22" });
  });
  it("weekend on Sunday is just today", () => {
    expect(dateRange("weekend", new Date("2026-11-22T10:00:00Z"))).toEqual({ from: "2026-11-22", to: "2026-11-22" });
  });
  it("uses Berlin date near midnight UTC", () => {
    // 23:30 UTC on Fri = 00:30 Sat in Berlin
    expect(dateRange("today", new Date("2026-11-20T23:30:00Z"))).toEqual({ from: "2026-11-21", to: "2026-11-21" });
  });
});

import { toBerlinIso } from "./time";
describe("toBerlinIso", () => {
  it("formats winter and summer times with the Berlin offset", () => {
    expect(toBerlinIso(new Date("2026-11-21T09:00:00Z"))).toBe("2026-11-21T10:00:00+01:00");
    expect(toBerlinIso(new Date("2026-07-04T22:30:00Z"))).toBe("2026-07-05T00:30:00+02:00");
  });
});
