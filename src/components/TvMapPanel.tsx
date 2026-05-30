import { MAP_PANEL_URL } from "../constants/mapPanel";
import { publicAssetSrc } from "../utils/publicAssetSrc";
import styles from "./TvMapPanel.module.css";

export function TvMapPanel() {
  if (!MAP_PANEL_URL) {
    return (
      <div className={styles.root} aria-label="Map">
        <p className={styles.empty}>No map in <code>public/assets/panels/</code>.</p>
      </div>
    );
  }

  const src = publicAssetSrc(MAP_PANEL_URL);

  return (
    <div className={styles.root} aria-label="Map">
      <div className={styles.mapPhoto} style={{ backgroundImage: `url("${src}")` }} role="img" />
    </div>
  );
}
