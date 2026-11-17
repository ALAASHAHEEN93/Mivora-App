import { describe, expect, it } from "vitest";
import { validateListValue } from "./lists";

describe("list value validation", () => {
  it("accepts activity ids and calendar keys", () => {
    expect(validateListValue("saved", "demo-a1")).toBe("demo-a1");
    const key = "demo-a1|2026-11-21T10:00:00+01:00|2026-11-21T10:45:00+01:00";
    expect(validateListValue("planned", key)).toBe(key);
  });
  it("rejects junk", () => {
    expect(validateListValue("saved", "../etc")).toBeNull();
    expect(validateListValue("saved", 5)).toBeNull();
    expect(validateListValue("planned", "a|not-a-date|x")).toBeNull();
    expect(validateListValue("planned", "x".repeat(300))).toBeNull();
  });
});
