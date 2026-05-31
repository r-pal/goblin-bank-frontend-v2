import { findMapPanelUrl } from "../constants/mapPanel";
import { usePublicAssetList } from "../hooks/usePublicAssetList";
import { publicAssetSrc } from "../utils/publicAssetSrc";
import styles from "./TvMapPanel.module.css";

export function TvMapPanel() {
  const panelUrls = usePublicAssetList("assets/panels");
  const mapUrl = findMapPanelUrl(panelUrls);

  if (!mapUrl) {
    return (
      <div className={styles.root} aria-label="Map">
        <p className={styles.empty}>
          No map in <code>public/assets/panels/</code> (add a file matching{" "}
          <code>MAP 2.jpg</code>).
        </p>
      </div>
    );
  }

  const src = publicAssetSrc(mapUrl);

  return (
    <div className={styles.root} aria-label="Map">
      <div className={styles.mapPhoto} style={{ backgroundImage: `url("${src}")` }} role="img" />
    </div>
  );
}
