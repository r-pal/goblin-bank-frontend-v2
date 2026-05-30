import styles from "./TvGraphToggle.module.css";

export type TvPanelMode = "adverts" | "graph" | "map" | "auto";

export type TvPanelView = "adverts" | "graph" | "map";

type Props = {
  mode: TvPanelMode;
  /** Which view is on screen (during auto, follows the cycle). */
  activeView: TvPanelView;
  onModeChange: (mode: TvPanelMode) => void;
};

const VIEWS: { id: TvPanelView; label: string }[] = [
  { id: "adverts", label: "Adverts" },
  { id: "graph", label: "Graph" },
  { id: "map", label: "Map" },
];

export function TvGraphToggle({ mode, activeView, onModeChange }: Props) {
  const autoOn = mode === "auto";

  return (
    <div className={styles.bar} role="group" aria-label="Left panel view">
      {VIEWS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={styles.button}
          aria-pressed={autoOn ? activeView === id : mode === id}
          onClick={() => onModeChange(id)}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        className={styles.button}
        aria-pressed={autoOn}
        onClick={() => onModeChange("auto")}
      >
        Auto
      </button>
    </div>
  );
}
