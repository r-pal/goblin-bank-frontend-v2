import styles from "./TvGoblinFloater.module.css";

const GOBLIN_MASK = "/tv-float-main/Goblin_illustration_from_19th_century.png";

export function TvGoblinFloater() {
  return (
    <div className={styles.stage} aria-hidden>
      <div className={styles.drift}>
        <div className={styles.motion}>
          <div
            className={styles.figure}
            style={{
              WebkitMaskImage: `url(${GOBLIN_MASK})`,
              maskImage: `url(${GOBLIN_MASK})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
