import { useTheme } from "../theme/useTheme";
import type { ThemeOverride } from "../theme/ThemeProvider";
import styles from "./ThemeOverrideButton.module.css";

function nextOverride(cur: ThemeOverride): ThemeOverride {
  if (cur === "auto") return "day";
  if (cur === "day") return "night";
  return "auto";
}

export function ThemeOverrideButton() {
  const { override, setOverride } = useTheme();

  const label = override === "auto" ? "Auto" : override === "day" ? "Day" : "Night";

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={`Theme override: ${label}. Click to cycle.`}
      onClick={() => setOverride(nextOverride(override))}
    >
      {label}
    </button>
  );
}

