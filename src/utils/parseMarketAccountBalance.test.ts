import { describe, expect, test } from "vitest";
import { allMarketAccountsZero, parseMarketAccountBalance } from "./parseMarketAccountBalance";

describe("parseMarketAccountBalance", () => {
  test.each([
    ["Mossy Hollow ₲1,234", 1234],
    ["Bog End -₲50", -50],
    ["Bog End Ǥ12", 12],
    ["Hovel 9 ₲10", 10],
  ])("reads %j as %d", (line, expected) => {
    expect(parseMarketAccountBalance(line)).toBe(expected);
  });

  test.each(["", "Bog End 50", "₲5 Bog End"])("reads %j, which has no trailing balance, as 0", (line) => {
    expect(parseMarketAccountBalance(line)).toBe(0);
  });
});

describe("allMarketAccountsZero", () => {
  test("is true when every balance is zero", () => {
    expect(allMarketAccountsZero(["Mossy Hollow ₲0", "Bog End Ǥ0"])).toBe(true);
  });

  test("is false when any balance is non-zero, including negative", () => {
    expect(allMarketAccountsZero(["Mossy Hollow ₲0", "Bog End -₲3"])).toBe(false);
  });
});
