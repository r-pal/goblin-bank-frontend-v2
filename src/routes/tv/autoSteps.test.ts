import { describe, expect, test } from "vitest";
import { ADVERT_INTERVAL_MS, AUTO_PANEL_MS, GRAPH_CYCLE_MS } from "../../constants/tvTiming";
import { buildAutoSteps } from "./autoSteps";

describe("buildAutoSteps", () => {
  test("orders adverts, then each available graph, then the map", () => {
    const steps = buildAutoSteps(["coin", "interest", "wares"], 3);
    expect(steps.map((s) => (s.view === "graph" ? s.graph : s.view))).toEqual([
      "adverts",
      "coin",
      "interest",
      "wares",
      "map",
    ]);
  });

  test("gives the adverts step 5 seconds per advert", () => {
    expect(buildAutoSteps([], 12)[0]).toEqual({ view: "adverts", durationMs: 12 * ADVERT_INTERVAL_MS });
    expect(buildAutoSteps([], 1)[0]).toEqual({ view: "adverts", durationMs: 5_000 });
  });

  test("skips the adverts step when there are no adverts", () => {
    expect(buildAutoSteps(["coin"], 0).map((s) => s.view)).toEqual(["graph", "map"]);
  });

  test("only includes graphs that have data", () => {
    expect(buildAutoSteps(["wares"], 2)).toEqual([
      { view: "adverts", durationMs: 2 * ADVERT_INTERVAL_MS },
      { view: "graph", graph: "wares", durationMs: GRAPH_CYCLE_MS },
      { view: "map", durationMs: AUTO_PANEL_MS },
    ]);
  });

  test("falls back to adverts and the map when no graph has data", () => {
    expect(buildAutoSteps([], 4).map((s) => s.view)).toEqual(["adverts", "map"]);
  });

  test("always shows the map, even with nothing else", () => {
    expect(buildAutoSteps([], 0)).toEqual([{ view: "map", durationMs: AUTO_PANEL_MS }]);
  });
});
