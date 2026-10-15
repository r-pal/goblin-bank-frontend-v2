import { describe, expect, test } from "vitest";
import { parseWholeNumber } from "./parseWholeNumber";

describe("parseWholeNumber", () => {
  test.each([
    [" 42 ", 42],
    ["+50", 50],
    ["-30", -30],
    ["-0", 0],
  ])("reads %j as %d", (raw, expected) => {
    expect(parseWholeNumber(raw)).toBe(expected);
  });

  // "" is the original bug: Number("") is 0. "1e3" is also something Number() accepts.
  test.each(["", "1.5", "1e3", "1,000", "abc"])("rejects %j", (raw) => {
    expect(parseWholeNumber(raw)).toBeNull();
  });

  test("enforces a minimum", () => {
    expect(parseWholeNumber("0", { min: 0 })).toBe(0);
    expect(parseWholeNumber("-1", { min: 0 })).toBeNull();
  });

  test("can reject zero", () => {
    expect(parseWholeNumber("0", { allowZero: false })).toBeNull();
    expect(parseWholeNumber("-5", { allowZero: false })).toBe(-5);
  });
});
