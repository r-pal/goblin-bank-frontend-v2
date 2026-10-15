import { describe, expect, test } from "vitest";
import { buildTicks, ensureMinTwoPoints, formatElapsed, toChartData } from "./historyChartData";

const T0 = "2026-10-15T12:00:00.000Z";
const T1 = "2026-10-15T12:01:00.000Z";
const T2 = "2026-10-15T12:02:00.000Z";

test("ensureMinTwoPoints adds a matching point one second before a lone point", () => {
  expect(ensureMinTwoPoints([{ t: T0, v: 7 }])).toEqual([
    { t: "2026-10-15T11:59:59.000Z", v: 7 },
    { t: T0, v: 7 },
  ]);
});

describe("toChartData", () => {
  test("merges series into one row per timestamp, in elapsed seconds", () => {
    const rows = toChartData({
      series: [
        { key: "a", label: "A", points: [{ t: T0, v: 1 }, { t: T1, v: 2 }] },
        { key: "b", label: "B", points: [{ t: T2, v: 6 }, { t: T1, v: 5 }] },
      ],
    });

    expect(rows).toEqual([
      { elapsed: 0, tIso: T0, a: 1 },
      { elapsed: 60, tIso: T1, a: 2, b: 5 },
      { elapsed: 120, tIso: T2, b: 6 },
    ]);
  });

  test("skips points with unreadable timestamps", () => {
    const rows = toChartData({
      series: [{ key: "a", label: "A", points: [{ t: "not a date", v: 9 }, { t: T0, v: 1 }] }],
    });
    expect(rows).toEqual([{ elapsed: 0, tIso: T0, a: 1 }]);
  });
});

test.each([
  [30, "30s"],
  [90, "2m"],
  [5400, "1.5h"],
  [86400, "1.0d"],
])("formatElapsed shows %d seconds as %s", (seconds, expected) => {
  expect(formatElapsed(seconds)).toBe(expected);
});

describe("buildTicks", () => {
  test("steps in round units", () => {
    expect(buildTicks(3600)).toEqual([0, 1800, 3600]);
  });

  test("always starts at 0 and ends at the maximum", () => {
    for (const max of [45, 500, 10_000, 200_000]) {
      const ticks = buildTicks(max);
      expect(ticks[0]).toBe(0);
      expect(ticks.at(-1)).toBe(max);
    }
  });
});
