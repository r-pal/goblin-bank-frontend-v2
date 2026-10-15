import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Account, HistoryResponse } from "../api/types";
import {
  accountHistoryHasPoints,
  mergeLiveAccountBalances,
  mergeLiveInterestRates,
} from "./mergeLiveHistory";

const NOW = "2026-10-15T12:00:00.000Z";
const EARLIER = "2026-10-15T11:30:00.000Z";

const mossy: Account = { hovelSlug: "mossy-hollow", name: "Mossy Hollow", balanceCoins: 150, interestRatePercent: 5 };
const bog: Account = { hovelSlug: "bog-end", name: "Bog End", balanceCoins: 50, interestRatePercent: 3 };

const history = (v = 100, label = "Mossy Hollow"): HistoryResponse => ({
  series: [{ key: "mossy-hollow", label, points: [{ t: EARLIER, v }] }],
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("mergeLiveAccountBalances", () => {
  test("appends the live balance as a new point when it has changed", () => {
    const merged = mergeLiveAccountBalances(history(100), [mossy]);
    expect(merged.series[0]!.points).toEqual([
      { t: EARLIER, v: 100 },
      { t: NOW, v: 150 },
    ]);
  });

  test("moves the last point to now when the balance hasn't changed", () => {
    const merged = mergeLiveAccountBalances(history(150), [mossy]);
    expect(merged.series[0]!.points).toEqual([{ t: NOW, v: 150 }]);
  });

  test("starts a new series for a hovel with no history yet", () => {
    const merged = mergeLiveAccountBalances(history(100), [mossy, bog]);
    expect(merged.series[1]).toEqual({ key: "bog-end", label: "Bog End", points: [{ t: NOW, v: 50 }] });
  });

  test("updates a series label to the hovel's current name", () => {
    const merged = mergeLiveAccountBalances(history(100, "Old Name"), [mossy]);
    expect(merged.series[0]!.label).toBe("Mossy Hollow");
  });

  test("does not change its input", () => {
    const input = history(100);
    mergeLiveAccountBalances(input, [mossy, bog]);
    expect(input).toEqual(history(100));
  });
});

test("mergeLiveInterestRates uses the interest rate rather than the balance", () => {
  const merged = mergeLiveInterestRates(history(2), [mossy]);
  expect(merged.series[0]!.points.at(-1)).toEqual({ t: NOW, v: 5 });
});

test("accountHistoryHasPoints counts live accounts as data, but needs history to exist", () => {
  expect(accountHistoryHasPoints(null, [mossy])).toBe(false);
  expect(accountHistoryHasPoints({ series: [] }, [mossy])).toBe(true);
});
