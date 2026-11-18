import { describe, expect, it } from "vitest";
import { isRainyDay, outlookDay } from "./weather";

const hour = (h: number, extra: Record<string, unknown>) => ({ timestamp: `2026-11-19T${String(h).padStart(2, "0")}:00:00+01:00`, ...extra });

describe("rain outlook", () => {
  it("needs at least three wet daytime hours", () => {
    expect(isRainyDay([hour(10, { condition: "rain" }), hour(11, { condition: "rain" })])).toBe(false);
    expect(isRainyDay([hour(10, { condition: "rain" }), hour(12, { precipitation: 1.2 }), hour(15, { precipitation_probability: 80 })])).toBe(true);
  });

  it("ignores night rain and light drizzle chances", () => {
    expect(isRainyDay([hour(2, { condition: "rain" }), hour(3, { condition: "rain" }), hour(22, { condition: "rain" })])).toBe(false);
    expect(isRainyDay([10, 11, 12, 13].map((h) => hour(h, { condition: "dry", precipitation: 0.1, precipitation_probability: 30 })))).toBe(false);
  });

  it("talks about today until 15:00, then tomorrow (Berlin time)", () => {
    expect(outlookDay(new Date("2026-11-18T10:00:00Z"))).toEqual({ day: "2026-11-18", when: "today" });
    expect(outlookDay(new Date("2026-11-18T15:30:00Z"))).toEqual({ day: "2026-11-19", when: "tomorrow" });
  });
});
