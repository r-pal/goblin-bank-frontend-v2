import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useAutoCycle } from "./useAutoCycle";

type Step = { view: string; durationMs: number };

/** A fresh array of fresh objects on every call, like state replaced by a poll. */
const cycle = (): Step[] => [
  { view: "adverts", durationMs: 20_000 },
  { view: "coin", durationMs: 15_000 },
  { view: "map", durationMs: 30_000 },
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
});
