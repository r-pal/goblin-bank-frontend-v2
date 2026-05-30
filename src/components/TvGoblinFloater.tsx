import { publicAssetSrc } from "../utils/publicAssetSrc";
import styles from "./TvGoblinFloater.module.css";

const GOBLIN_SRC = publicAssetSrc(
  "/assets/tv-float-main/Goblin_illustration_from_19th_century.png",
);

export function TvGoblinFloater() {
  return (
    <div className={styles.stage} aria-hidden>
      <div className={styles.drift}>
        <div className={styles.motion}>
          <img className={styles.figure} src={GOBLIN_SRC} alt="" draggable={false} />
        </div>
      </div>
    </div>
  );
}
