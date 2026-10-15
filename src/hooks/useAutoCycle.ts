import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shows each step for its `durationMs`, in order, then loops.
 *
 * The timer only restarts when the current step or its duration changes, so
 * re-rendering with a new-but-equal `steps` array (e.g. after a poll) never
 * resets the cycle, and steps added or removed elsewhere don't extend this one.
 */
export function useAutoCycle<T extends { durationMs: number }>(
  steps: readonly T[],
  enabled: boolean,
) {
  const [index, setIndex] = useState(0);
  const count = steps.length;
  const current = count > 0 ? index % count : 0;
  const step = enabled ? (steps[current] ?? null) : null;
  const durationMs = step?.durationMs;
  const canCycle = count > 1;

  const countRef = useRef(count);
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    if (durationMs === undefined || !canCycle) return;
    const id = window.setTimeout(() => {
      const n = countRef.current;
      setIndex((i) => ((i % n) + 1) % n);
    }, durationMs);
    return () => window.clearTimeout(id);
  }, [current, durationMs, canCycle]);

  const reset = useCallback(() => setIndex(0), []);

  return { step, reset };
}
