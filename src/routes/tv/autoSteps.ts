import { ADVERT_INTERVAL_MS, AUTO_PANEL_MS, GRAPH_CYCLE_MS } from "../../constants/tvTiming";

export type GraphKind = "coin" | "interest" | "wares";

export type AutoStep =
  | { view: "adverts"; durationMs: number }
  | { view: "map"; durationMs: number }
  | { view: "graph"; graph: GraphKind; durationMs: number };

export function buildAutoSteps(
  availableGraphs: readonly GraphKind[],
  advertCount: number,
): AutoStep[] {
  const steps: AutoStep[] = [];
  if (advertCount > 0) {
    steps.push({ view: "adverts", durationMs: advertCount * ADVERT_INTERVAL_MS });
  }
  for (const graph of availableGraphs) {
    steps.push({ view: "graph", graph, durationMs: GRAPH_CYCLE_MS });
  }
  steps.push({ view: "map", durationMs: AUTO_PANEL_MS });
  return steps;
}
