import styles from "./TvGraphToggle.module.css";

type Props = {
  showGraph: boolean;
  onToggle: () => void;
};

export function TvGraphToggle({ showGraph, onToggle }: Props) {
  const label = showGraph ? "Adverts" : "Graph";

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={showGraph ? "Show adverts" : "Show history graphs"}
      aria-pressed={showGraph}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}
