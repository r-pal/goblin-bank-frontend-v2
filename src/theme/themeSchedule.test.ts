import { expect, test } from "vitest";
import { getScheduledMode } from "./themeSchedule";

const at = (hour: number, minute: number) => new Date(2026, 9, 15, hour, minute);

test.each([
  [7, 59, "night"],
  [8, 0, "day"],
  [19, 59, "day"],
  [20, 0, "night"],
])("%d:%d is %s", (hour, minute, expected) => {
  expect(getScheduledMode(at(hour, minute))).toBe(expected);
});
