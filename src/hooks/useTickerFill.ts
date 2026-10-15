import { useLayoutEffect, useState, type RefObject } from "react";

export const TICKER_SEP = "    ✦    ";

/** Build repeated text so one marquee half is at least as wide as the container. */
export function useTickerFilledText(
  containerRef: RefObject<HTMLElement | null>,
  measureRef: RefObject<HTMLElement | null>,
  unitText: string,
) {
  const [filledText, setFilledText] = useState(unitText);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const calc = () => {
      const cw = container.getBoundingClientRect().width;
      const unitW = measure.getBoundingClientRect().width;
      if (unitW <= 0 || cw <= 0) {
        setFilledText(unitText);
        return;
      }

      const repeats = Math.max(1, Math.ceil(cw / unitW));
      setFilledText(Array.from({ length: repeats }, () => unitText).join(TICKER_SEP));
    };

    calc();
    const ro = new ResizeObserver(() => calc());
    ro.observe(container);
    ro.observe(measure);
    return () => ro.disconnect();
  }, [containerRef, measureRef, unitText]);

  return filledText;
}

/** Duration for translateX(-50%) loop: one half-width / speed. */
export function useTickerDuration(
  contentRef: RefObject<HTMLElement | null>,
  speedPxPerSec: number,
  contentKey: string,
) {
  const [durationSec, setDurationSec] = useState(30);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const calc = () => {
      const halfW = content.getBoundingClientRect().width;
      setDurationSec(Math.max(5, halfW / speedPxPerSec));
    };

    calc();
    const ro = new ResizeObserver(() => calc());
    ro.observe(content);
    return () => ro.disconnect();
  }, [contentRef, speedPxPerSec, contentKey]);

  return durationSec;
}
