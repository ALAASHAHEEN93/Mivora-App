import { describe, expect, it } from "vitest";
import { parseAges } from "./ages";

describe("device child ages", () => {
  it("keeps valid whole years, sorted and unique", () => {
    expect(parseAges("7,3,3")).toEqual([3, 7]);
    expect(parseAges(["0", "12"])).toEqual([0, 12]);
  });
  it("drops junk and caps the list", () => {
    expect(parseAges("x,-1,18,4.5,<b>,5")).toEqual([5]);
    expect(parseAges("1,2,3,4,5,6,7,8")).toHaveLength(6);
    expect(parseAges(undefined)).toEqual([]);
  });
});
