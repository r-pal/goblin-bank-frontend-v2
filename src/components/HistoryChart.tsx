import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoryResponse } from "../api/types";
import styles from "./HistoryChart.module.css";

type Props = {
  data: HistoryResponse;
  /** Fixed pixel height (office modals). Omit when `fill` is true. */
  height?: number;
  /** Fill parent flex/grid cell (TV). */
  fill?: boolean;
  variant?: "default" | "tv";
  /** Pin Y axis minimum to 0 (e.g. ware prices). Account balances may be negative. */
  yMinZero?: boolean;
};

type ChartRow = {
  elapsed: number;
  tIso: string;
} & Record<string, unknown>;

function parseTime(iso: string): number {
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : NaN;
}

function toChartData(data: HistoryResponse): ChartRow[] {
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
      row[s.label] = p.v;
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

function formatElapsed(seconds: number): string {
  const s = Math.max(0, seconds);
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${(s / 3600).toFixed(1)}h`;
  return `${(s / 86400).toFixed(1)}d`;
}

function buildTicks(maxSeconds: number): number[] {
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

const COLORS = [
  "#ff4fd8",
  "#5efcff",
  "#b07bff",
  "#ffcc4f",
  "#55ff8a",
  "#ff6b6b",
  "#7aa7ff",
];

/** Match tickertape `clamp(32px, 3.8vmin, 58px)` for Recharts (needs px numbers). */
function useTvChartFontSize(enabled: boolean): {
  probeRef: React.RefObject<HTMLSpanElement>;
  fontSize: number;
} {
  const probeRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(40);

  useLayoutEffect(() => {
    if (!enabled) return;
    const el = probeRef.current;
    if (!el) return;

    const read = () => {
      const px = parseFloat(getComputedStyle(el).fontSize);
      if (Number.isFinite(px) && px > 0) setFontSize(px);
    };

    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    window.addEventListener("resize", read);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", read);
    };
  }, [enabled]);

  return { probeRef, fontSize };
}

export function HistoryChart({
  data,
  height = 280,
  fill = false,
  variant = "default",
  yMinZero = false,
}: Props) {
  const isTv = variant === "tv";
  const { probeRef, fontSize: tvFont } = useTvChartFontSize(isTv);

  const chartData = useMemo(() => toChartData(data), [data]);
  const labels = useMemo(() => data.series.map((s) => s.label), [data.series]);

  const maxElapsed = useMemo(
    () => (chartData.length ? Math.max(...chartData.map((r) => r.elapsed)) : 0),
    [chartData],
  );

  const xTicks = useMemo(() => buildTicks(maxElapsed), [maxElapsed]);

  const anyPoints = data.series.some((s) => s.points.length > 0);
  if (!anyPoints || chartData.length === 0) return null;

  const tickFont = isTv ? tvFont : 12;
  const yWidth = isTv ? Math.round(tvFont * 3.8) : 60;
  const strokeWidth = isTv ? 4.5 : 2;
  const manySeries = labels.length > 3;
  const legendFont = isTv && manySeries ? Math.max(18, Math.round(tvFont * 0.52)) : tickFont;
  const legendRowH = isTv ? Math.round(legendFont * 1.15) : 22;
  const legendRows = isTv ? Math.ceil(labels.length / 3) : 1;
  const legendHeight = isTv ? Math.min(96, 8 + legendRows * legendRowH) : 36;
  const legendOnTop = isTv;

  const rootStyle = fill ? undefined : { height };
  const rootClass = fill ? `${styles.fill} ${styles.root}` : undefined;

  return (
    <div className={rootClass} style={rootStyle}>
      {isTv ? (
        <span ref={probeRef} className={styles.fontProbe} aria-hidden>
          0
        </span>
      ) : null}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: legendOnTop ? legendHeight + 10 : isTv ? 12 : 8,
            right: isTv ? 16 : 12,
            bottom: legendOnTop ? (isTv ? 16 : 8) : isTv ? legendHeight + 12 : 8,
            left: isTv ? 8 : 4,
          }}
        >
          <XAxis
            dataKey="elapsed"
            type="number"
            domain={[0, maxElapsed]}
            scale="linear"
            allowDataOverflow
            ticks={xTicks}
            tick={{ fill: "var(--text)", fontSize: tickFont, fontFamily: "var(--font-display)" }}
            tickFormatter={formatElapsed}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis
            width={yWidth}
            domain={yMinZero ? [0, "auto"] : ["auto", "auto"]}
            tick={{ fill: "var(--text)", fontSize: tickFont, fontFamily: "var(--font-display)" }}
          />
          <Tooltip
            labelFormatter={(elapsed) => `T+${formatElapsed(Number(elapsed))}`}
            contentStyle={{
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 10,
              color: "var(--text)",
              fontSize: isTv ? tvFont : 14,
              fontFamily: "var(--font-body)",
            }}
          />
          {isTv ? (
            <Legend
              verticalAlign={legendOnTop ? "top" : "bottom"}
              align="center"
              iconType="line"
              iconSize={Math.round(legendFont * 0.7)}
              wrapperStyle={{
                color: "var(--text)",
                fontFamily: "var(--font-display)",
                fontSize: legendFont,
                fontWeight: 600,
                lineHeight: 1.15,
                paddingTop: legendOnTop ? 0 : 6,
                paddingBottom: legendOnTop ? 4 : 0,
              }}
            />
          ) : null}
          {labels.map((label, i) => (
            <Line
              key={label}
              name={label}
              type="monotone"
              dataKey={label}
              dot={false}
              strokeWidth={strokeWidth}
              stroke={COLORS[i % COLORS.length]}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
