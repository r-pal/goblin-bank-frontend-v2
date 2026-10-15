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
import {
  buildTicks,
  formatElapsed,
  prepareHistoryForChart,
  toChartData,
} from "../utils/historyChartData";
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
  /** Appended to Y-axis ticks and tooltip values (e.g. `%`). */
  valueSuffix?: string;
  /** TV charts: hide when another chart already shows the same series labels. */
  showLegend?: boolean;
  /** TV legend placement (bottom leaves room for section title overlay). */
  legendPosition?: "top" | "bottom";
};

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
  valueSuffix = "",
  showLegend = true,
  legendPosition = "bottom",
}: Props) {
  const isTv = variant === "tv";
  const { probeRef, fontSize: tvFont } = useTvChartFontSize(isTv);

  const series = useMemo(() => prepareHistoryForChart(data).series, [data]);
  const chartData = useMemo(() => toChartData({ series }), [series]);

  const endDotRowByKey = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of series) {
      for (let i = chartData.length - 1; i >= 0; i--) {
        const v = chartData[i]![s.key];
        if (typeof v === "number" && Number.isFinite(v)) {
          m.set(s.key, i);
          break;
        }
      }
    }
    return m;
  }, [chartData, series]);

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
  const manySeries = series.length > 3;
  const legendFont = isTv && manySeries ? Math.max(18, Math.round(tvFont * 0.52)) : tickFont;
  const legendRowH = isTv ? Math.round(legendFont * 1.15) : 22;
  const legendRows = isTv ? Math.ceil(series.length / 3) : 1;
  const legendHeight = isTv ? Math.min(96, 8 + legendRows * legendRowH) : 36;
  const legendOnTop = isTv && legendPosition === "top";
  const drawLegend = isTv && showLegend;
  const tvTitleBand = isTv ? Math.round(tvFont * 1.35) : 0;

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
            top:
              (drawLegend && legendOnTop ? legendHeight + 10 : isTv ? 12 : 8) +
              (isTv ? tvTitleBand : 0),
            right: isTv ? 16 : 12,
            bottom:
              drawLegend && !legendOnTop
                ? legendHeight + 12
                : drawLegend && legendOnTop
                  ? isTv
                    ? 16
                    : 8
                  : isTv
                    ? 12
                    : 8,
            left: isTv ? 8 : 4,
          }}
        >
          <XAxis
            dataKey="elapsed"
            type="number"
            domain={[0, maxElapsed]}
            scale="linear"
            allowDataOverflow
            ticks={isTv ? [] : xTicks}
            tick={
              isTv
                ? false
                : { fill: "var(--text)", fontSize: tickFont, fontFamily: "var(--font-display)" }
            }
            tickFormatter={formatElapsed}
            axisLine={!isTv}
            tickLine={!isTv}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis
            width={yWidth}
            domain={yMinZero ? [0, "auto"] : ["auto", "auto"]}
            tick={{
              fill: "var(--text)",
              fontSize: tickFont,
              fontFamily: "var(--font-display)",
            }}
            tickFormatter={(v) => `${v}${valueSuffix}`}
          />
          <Tooltip
            labelFormatter={(elapsed) => `T+${formatElapsed(Number(elapsed))}`}
            formatter={(value: number) => [`${value}${valueSuffix}`, ""]}
            contentStyle={{
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 10,
              color: "var(--text)",
              fontSize: isTv ? tvFont : 14,
              fontFamily: "var(--font-body)",
            }}
          />
          {drawLegend ? (
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
                maxHeight: legendHeight,
                overflow: "hidden",
              }}
            />
          ) : null}
          {series.map((s, i) => (
            <Line
              key={s.key}
              name={s.label}
              type="monotone"
              dataKey={s.key}
              connectNulls
              dot={
                isTv
                  ? (dotProps) => {
                      const key = String(dotProps.dataKey ?? "");
                      if (dotProps.index !== endDotRowByKey.get(key)) {
                        return <g />;
                      }
                      if (dotProps.cx == null || dotProps.cy == null) {
                        return <g />;
                      }
                      const r = Math.max(5, Math.round(tvFont * 0.14));
                      return (
                        <circle
                          cx={dotProps.cx}
                          cy={dotProps.cy}
                          r={r}
                          fill={dotProps.stroke}
                          stroke="var(--text)"
                          strokeWidth={1}
                        />
                      );
                    }
                  : false
              }
              strokeWidth={strokeWidth}
              stroke={COLORS[i % COLORS.length]}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
