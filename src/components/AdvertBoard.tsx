import { useEffect, useMemo, useState } from "react";
import { ADVERT_URLS } from "../constants/advertPaths";
import { publicAssetSrc } from "../utils/publicAssetSrc";
import styles from "./AdvertBoard.module.css";

const ADVERT_INTERVAL_MS = 10_000;

function isFullscreenAdvert(url: string): boolean {
  return /MAP(\s|%20)?2\.jpg$/i.test(url);
}

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function pickRandomIndex(length: number, exclude: number): number {
  if (length <= 1) return 0;
  let next = exclude;
  while (next === exclude) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}

export function AdvertBoard() {
  // Exclude the fullscreen map from the rotating panel.
  const urls = useMemo(
    () => shuffle(ADVERT_URLS.filter((u) => !isFullscreenAdvert(u))),
    [],
  );
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(false);
  const currentUrl = urls[idx] ?? "";

  useEffect(() => {
    if (urls.length <= 1) return;
    const id = window.setInterval(() => {
      setFade(true);
      window.setTimeout(() => {
        setIdx((current) => pickRandomIndex(urls.length, current));
        setFade(false);
      }, 320);
    }, ADVERT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [urls]);

  if (urls.length === 0) {
    return (
      <div className={styles.root} aria-label="Panels">
        <p className={styles.empty}>
          No adverts in <code>public/assets/adverts/</code>. Add images and run{" "}
          <code>npm run sync:assets</code>.
        </p>
      </div>
    );
  }

  const imageClass = fade ? styles.imageFade : styles.image;

  return (
    <div className={styles.root} aria-label="Panels">
      <img
        key={currentUrl}
        className={imageClass}
        src={publicAssetSrc(currentUrl)}
        alt=""
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
