import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { WareMarketItem } from "../api/types";
import styles from "./Tickertape.module.css";
import { TICKER_SEP, useTickerDuration } from "./useTickerFill";

type Props = {
  wares: WareMarketItem[];
  heightIn?: number;
  speedPxPerSec: number;
};

function WareSegment({ ware }: { ware: WareMarketItem }) {
  const trendClass =
    ware.trend === "up" ? styles.trendUp : ware.trend === "down" ? styles.trendDown : styles.trendFlat;
  return (
    <span className={styles.segment}>
      <span className={trendClass} aria-hidden>
        {ware.trend === "up" ? "▲" : ware.trend === "down" ? "▼" : ""}
      </span>
      <span className={styles.wareName}>{ware.name}</span>
      <span className={styles.warePrice}>{ware.price}</span>
    </span>
  );
}

function WaresUnit({ wares }: { wares: WareMarketItem[] }) {
  return (
    <>
      {wares.map((w, i) => (
        <span key={`${w.name}-${i}`}>
          <WareSegment ware={w} />
          <span className={styles.sep} aria-hidden>
            {" "}
            ✦{" "}
          </span>
        </span>
      ))}
    </>
  );
}

export function WaresTickertape({ wares, heightIn = 1, speedPxPerSec }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [repeatCount, setRepeatCount] = useState(1);

  const unit = useMemo(() => <WaresUnit wares={wares} />, [wares]);
  const filled = useMemo(() => {
    const blocks: ReactNode[] = [];
    for (let i = 0; i < repeatCount; i++) {
      blocks.push(
        <span key={i} className={styles.repeatBlock}>
          <WaresUnit wares={wares} />
          {i < repeatCount - 1 ? (
            <span className={styles.sep} aria-hidden>
              {TICKER_SEP}
            </span>
          ) : null}
        </span>,
      );
    }
    return blocks;
  }, [wares, repeatCount]);

  const filledKey = `${repeatCount}-${wares.map((w) => `${w.name}:${w.price}`).join("|")}`;
  const durationSec = useTickerDuration(contentRef, speedPxPerSec, filledKey);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure || wares.length === 0) return;

    const calc = () => {
      const cw = container.getBoundingClientRect().width;
      const unitW = measure.getBoundingClientRect().width;
      if (unitW <= 0 || cw <= 0) {
        setRepeatCount(1);
        return;
      }
      setRepeatCount(Math.max(1, Math.ceil(cw / unitW)));
    };

    calc();
    const ro = new ResizeObserver(() => calc());
    ro.observe(container);
    ro.observe(measure);
    return () => ro.disconnect();
  }, [wares]);

  if (wares.length === 0) return null;

  const compact = heightIn < 0.8;
  const contentClass = `${styles.content} ${styles.contentDark} ${styles.waresTrack}`;

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${styles.dark}${compact ? ` ${styles.compact}` : ""}`}
      style={{ height: `${heightIn}in` }}
    >
      <div ref={measureRef} className={`${contentClass} ${styles.measure}`} aria-hidden>
        {unit}
      </div>

      <div
        className={styles.track}
        style={{ ["--duration" as string]: `${durationSec}s` }}
      >
        <div ref={contentRef} className={contentClass}>
          {filled}
        </div>
        <div className={contentClass} aria-hidden>
          {filled}
        </div>
      </div>
    </div>
  );
}
