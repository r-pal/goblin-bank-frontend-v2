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

  test("gives adverts 5 seconds each, graphs and the map their fixed durations", () => {
    expect(buildAutoSteps(["wares"], 2)).toEqual([
      { view: "adverts", durationMs: 2 * ADVERT_INTERVAL_MS },
      { view: "graph", graph: "wares", durationMs: GRAPH_CYCLE_MS },
      { view: "map", durationMs: AUTO_PANEL_MS },
    ]);
  });

  test("skips the adverts step when there are no adverts", () => {
    expect(buildAutoSteps(["coin"], 0).map((s) => s.view)).toEqual(["graph", "map"]);
  });
});
