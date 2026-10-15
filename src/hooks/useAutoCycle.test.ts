import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useAutoCycle } from "./useAutoCycle";

type Step = { view: string; durationMs: number };

const DURATIONS: Record<string, number> = { adverts: 20_000, coin: 15_000, map: 30_000 };

/** A fresh array of fresh objects on every call, like state replaced by a poll. */
const cycle = (): Step[] => [
  { view: "adverts", durationMs: DURATIONS.adverts! },
  { view: "coin", durationMs: DURATIONS.coin! },
  { view: "map", durationMs: DURATIONS.map! },
];

function renderCycle(steps: Step[] = cycle(), enabled = true) {
  return renderHook((props: { steps: Step[]; enabled: boolean }) => useAutoCycle(props.steps, props.enabled), {
    initialProps: { steps, enabled },
  });
}

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAutoCycle", () => {
  test("holds the first step for its full duration, then moves on", () => {
    const { result } = renderCycle();
    expect(result.current.step?.view).toBe("adverts");

    advance(19_999);
    expect(result.current.step?.view).toBe("adverts");

    advance(1);
    expect(result.current.step?.view).toBe("coin");
  });

  test("loops back to the first step after the last", () => {
    const { result } = renderCycle();
    advance(20_000);
    advance(15_000);
    expect(result.current.step?.view).toBe("map");

    advance(30_000);
    expect(result.current.step?.view).toBe("adverts");
  });

  test("re-renders with fresh but equal steps, as after a poll, do not reset the cycle", () => {
    const { result, rerender } = renderCycle();

    for (let i = 0; i < 4; i++) {
      advance(5_000);
      rerender({ steps: cycle(), enabled: true });
    }

    expect(result.current.step?.view).toBe("coin");
  });

  test("a step added mid-cycle does not extend the step on screen", () => {
    const { result, rerender } = renderCycle([
      { view: "adverts", durationMs: 20_000 },
      { view: "map", durationMs: 30_000 },
    ]);

    advance(12_000);
    rerender({ steps: cycle(), enabled: true });
    advance(8_000);

    expect(result.current.step?.view).toBe("coin");
  });

  test("a step removed while on screen moves on without stalling", () => {
    const { result, rerender } = renderCycle();
    advance(20_000);
    expect(result.current.step?.view).toBe("coin");

    rerender({
      steps: [
        { view: "adverts", durationMs: 20_000 },
        { view: "map", durationMs: 30_000 },
      ],
      enabled: true,
    });
    expect(result.current.step?.view).toBe("map");

    advance(30_000);
    expect(result.current.step?.view).toBe("adverts");
  });

  test("shows nothing and runs no timer when disabled", () => {
    const { result } = renderCycle(cycle(), false);
    expect(result.current.step).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  test("reset returns to the first step and gives it its full duration", () => {
    const { result } = renderCycle();
    advance(20_000);
    expect(result.current.step?.view).toBe("coin");

    act(() => result.current.reset());
    expect(result.current.step?.view).toBe("adverts");

    advance(19_999);
    expect(result.current.step?.view).toBe("adverts");
    advance(1);
    expect(result.current.step?.view).toBe("coin");
  });

  test("clears its timer on unmount", () => {
    const { unmount } = renderCycle();
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  test("ten minutes of 5-second polls keep every step at its own duration", () => {
    const { result, rerender } = renderCycle();
    const changes = [{ view: result.current.step!.view, at: 0 }];

    for (let t = 1_000; t <= 600_000; t += 1_000) {
      advance(1_000);
      if (t % 5_000 === 0) rerender({ steps: cycle(), enabled: true });
      const view = result.current.step!.view;
      if (view !== changes.at(-1)!.view) changes.push({ view, at: t });
    }

    const order = ["adverts", "coin", "map"];
    for (let i = 1; i < changes.length; i++) {
      const prev = changes[i - 1]!;
      const next = changes[i]!;
      expect(next.at - prev.at).toBe(DURATIONS[prev.view]);
      expect(next.view).toBe(order[(order.indexOf(prev.view) + 1) % order.length]);
    }
    // 600 s over a 65 s cycle of 3 steps.
    expect(changes.length).toBeGreaterThanOrEqual(27);
  });
});
