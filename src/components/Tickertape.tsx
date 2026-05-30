import { useMemo, useRef } from "react";
import styles from "./Tickertape.module.css";
import { useTickerDuration, useTickerFilledText } from "./useTickerFill";

type Props = {
  items: string[];
  heightIn?: number;
  speedPxPerSec: number;
  variant?: "light" | "dark";
};

export function Tickertape({ items, heightIn = 1, speedPxPerSec, variant = "dark" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const unitText = useMemo(() => items.join("    ✦    "), [items]);
  const filledText = useTickerFilledText(containerRef, measureRef, unitText);
  const durationSec = useTickerDuration(contentRef, speedPxPerSec, filledText);

  if (items.length === 0) return null;

  const containerClass =
    variant === "light" ? `${styles.container} ${styles.light}` : `${styles.container} ${styles.dark}`;
  const contentClass =
    variant === "light" ? `${styles.content} ${styles.contentLight}` : `${styles.content} ${styles.contentDark}`;

  return (
    <div
      ref={containerRef}
      className={containerClass}
      style={{ height: `${heightIn}in` }}
    >
      <span ref={measureRef} className={`${contentClass} ${styles.measure}`} aria-hidden>
        {unitText}
      </span>

      <div
        className={styles.track}
        style={{ ["--duration" as string]: `${durationSec}s` }}
      >
        <div ref={contentRef} className={contentClass}>
          {filledText}
        </div>
        <div className={contentClass} aria-hidden>
          {filledText}
        </div>
      </div>
    </div>
  );
}
