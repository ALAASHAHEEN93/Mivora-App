import { describe, expect, it } from "vitest";
import { decodePlanned, encodePlanned, findConflicts, monthGrid, shiftMonth, startOfWeek, toIcs, weekDays } from "./calendar";

const item = (id: string, s: string, e: string) => ({ activityId: id, startsAt: s, endsAt: e });

describe("month grid", () => {
  it("November 2026 starts on Sunday → 6 empty cells before (Monday-first)", () => {
    const g = monthGrid(2026, 11);
    expect(g[0]).toEqual([null, null, null, null, null, null, "2026-11-01"]);
    expect(g.flat().filter(Boolean)).toHaveLength(30);
    expect(g.every((w) => w.length === 7)).toBe(true);
  });

  it("handles leap February", () => {
    expect(monthGrid(2028, 2).flat().filter(Boolean)).toHaveLength(29);
  });

  it("shifts months across years", () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2027, 1, -1)).toEqual({ year: 2026, month: 12 });
  });
});

describe("weeks", () => {
  it("weeks start on Monday", () => {
    expect(startOfWeek("2026-11-22")).toBe("2026-11-16"); // Sunday → Monday before
    expect(weekDays("2026-11-18")).toEqual([
      "2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22",
    ]);
  });
});

describe("conflicts", () => {
  it("flags overlapping items only", () => {
    const a = item("a", "2026-11-21T10:00:00+01:00", "2026-11-21T11:00:00+01:00");
    const b = item("b", "2026-11-21T10:30:00+01:00", "2026-11-21T12:00:00+01:00");
    const c = item("c", "2026-11-21T12:00:00+01:00", "2026-11-21T13:00:00+01:00"); // back-to-back with b: ok
    const res = findConflicts([c, b, a]);
    expect([...res].sort()).toEqual([encodePlanned(a), encodePlanned(b)].sort());
  });
});

describe("storage encoding", () => {
  it("round-trips and rejects junk", () => {
    const p = item("a1", "2026-11-21T10:00:00+01:00", "2026-11-21T10:45:00+01:00");
    expect(decodePlanned(encodePlanned(p))).toEqual(p);
    expect(decodePlanned("a1|nope|x")).toBeNull();
    expect(decodePlanned("garbage")).toBeNull();
  });
});

describe("ics export", () => {
  it("writes UTC times and escapes text", () => {
    const ics = toIcs(
      [{ uid: "a1-x", title: "Yoga, Kinder; Spaß", location: "Ehrenfeld", startsAt: "2026-11-21T10:00:00+01:00", endsAt: "2026-11-21T10:45:00+01:00" }],
      new Date("2026-11-16T12:00:00Z"),
    );
    expect(ics).toContain("DTSTART:20261121T090000Z");
    expect(ics).toContain("DTEND:20261121T094500Z");
    expect(ics).toContain("SUMMARY:Yoga\\, Kinder\\; Spaß");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});
