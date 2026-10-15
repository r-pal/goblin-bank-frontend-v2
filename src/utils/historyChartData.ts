import type { HistoryPoint, HistoryResponse } from "../api/types";

export type ChartRow = {
  elapsed: number;
  tIso: string;
} & Record<string, unknown>;

function parseTime(iso: string): number {
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : NaN;
}

/** Recharts needs ≥2 points per line; live-only hovels often have one. */
export function ensureMinTwoPoints(points: HistoryPoint[]): HistoryPoint[] {
  if (points.length >= 2) return points;
  if (points.length === 0) return points;
  const p = points[0]!;
  const ms = parseTime(p.t);
  const earlier = Number.isFinite(ms) ? new Date(ms - 1000).toISOString() : p.t;
  return [{ t: earlier, v: p.v }, p];
}

export function prepareHistoryForChart(data: HistoryResponse): HistoryResponse {
  return {
    series: data.series.map((s) => ({
      ...s,
      points: ensureMinTwoPoints(s.points),
    })),
  };
}

export function toChartData(data: HistoryResponse): ChartRow[] {
  let t0Ms = Infinity;

  for (const s of data.series) {
    for (const p of s.points) {
      const ms = parseTime(p.t);
      if (Number.isFinite(ms) && ms < t0Ms) t0Ms = ms;
    }
  }

  if (!Number.isFinite(t0Ms)) return [];

  const map = new Map<string, ChartRow>();
  for (const s of data.series) {
    for (const p of s.points) {
      const ms = parseTime(p.t);
      if (!Number.isFinite(ms)) continue;

      const existing = map.get(p.t);
      const row: ChartRow = existing ?? { elapsed: 0, tIso: p.t };
      row[s.key] = p.v;
      map.set(p.t, row);
    }
  }

  const rows = [...map.values()]
    .map((row) => ({
      ...row,
      elapsed: (parseTime(row.tIso) - t0Ms) / 1000,
    }))
    .sort((a, b) => a.elapsed - b.elapsed);

  const minElapsed = rows[0]?.elapsed ?? 0;
  if (minElapsed > 0) {
    return rows.map((row) => ({ ...row, elapsed: row.elapsed - minElapsed }));
  }

  return rows;
}

export function formatElapsed(seconds: number): string {
  const s = Math.max(0, seconds);
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${(s / 3600).toFixed(1)}h`;
  return `${(s / 86400).toFixed(1)}d`;
}

export function buildTicks(maxSeconds: number): number[] {
  if (maxSeconds <= 0) return [0];

  const roughStep = maxSeconds / 5;
  const step =
    roughStep <= 60
      ? 60
      : roughStep <= 300
        ? 300
        : roughStep <= 1800
          ? 1800
          : roughStep <= 3600
            ? 3600
            : 86400;

  const ticks: number[] = [0];
  for (let t = step; t < maxSeconds; t += step) {
    ticks.push(Math.round(t));
  }
  const last = Math.round(maxSeconds);
  if (ticks[ticks.length - 1] !== last) ticks.push(last);
  return ticks;
}
