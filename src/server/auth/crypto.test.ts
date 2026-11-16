import { describe, expect, it } from "vitest";
import { generateCode, hashCode, normalizeEmail, sameHash } from "./crypto";
import { parseChildInput } from "../family";

describe("auth helpers", () => {
  it("normalizes emails and rejects junk", () => {
    expect(normalizeEmail("  Anna@Example.DE ")).toBe("anna@example.de");
    expect(normalizeEmail("nope")).toBeNull();
    expect(normalizeEmail(42)).toBeNull();
  });
  it("makes 6-digit codes", () => {
    for (let i = 0; i < 50; i++) expect(generateCode()).toMatch(/^\d{6}$/);
  });
  it("binds code hashes to the email and secret", () => {
    const h = hashCode("a@x.de", "123456", "s".repeat(32));
    expect(sameHash(h, hashCode("a@x.de", "123456", "s".repeat(32)))).toBe(true);
    expect(sameHash(h, hashCode("b@x.de", "123456", "s".repeat(32)))).toBe(false);
    expect(sameHash(h, hashCode("a@x.de", "123456", "t".repeat(32)))).toBe(false);
  });
});

describe("child input validation", () => {
  const now = new Date("2026-11-17T12:00:00Z");
  it("accepts minimal data and trims nickname", () => {
    expect(parseChildInput({ nickname: "  Maus ", birthYear: "2020", interests: ["music", "bogus", "music"] }, now)).toEqual({
      nickname: "Maus",
      birthYear: 2020,
      interests: ["music"],
    });
  });
  it("rejects out-of-range birth years", () => {
    expect(parseChildInput({ birthYear: "2005" }, now)).toBeNull();
    expect(parseChildInput({ birthYear: "2030" }, now)).toBeNull();
    expect(parseChildInput({ birthYear: "abc" }, now)).toBeNull();
  });
});
