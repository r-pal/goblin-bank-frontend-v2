export type ThemeMode = "day" | "night";

/** Day runs from 08:00 up to (not including) 20:00, local time. */
export function getScheduledMode(now: Date): ThemeMode {
  const hour = now.getHours();
  return hour >= 8 && hour < 20 ? "day" : "night";
}
