import { useEffect, useLayoutEffect, useMemo, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import styles from "./AdvertBoard.module.css";

const ADVERT_INTERVAL_MS = 10_000;
const FULLSCREEN_ADVERT_PATH = "/adverts/MAP 2.jpg";

function isFullscreenAdvert(url: string): boolean {
  try {
    return decodeURIComponent(url) === FULLSCREEN_ADVERT_PATH;
  } catch {
    return url.includes("MAP%202.jpg") || url.includes("MAP 2.jpg");
  }
}

function shuffle<T>(items: T[]): T[] {
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

function loadAdvertUrls(): string[] {
  // Public dir assets are served at /adverts/*
  const modules = import.meta.glob("/public/adverts/*.{png,jpg,jpeg,webp}", {
    eager: true,
    as: "url",
  }) as Record<string, string>;

  return Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path]) => path.replace(/^\/public/, ""));
}

type Props = {
  portalRef?: RefObject<HTMLElement | null>;
};

export function AdvertBoard({ portalRef }: Props) {
  const urls = useMemo(() => shuffle(loadAdvertUrls()), []);
  const [idx, setIdx] = useState(() =>
    urls.length > 0 ? Math.floor(Math.random() * urls.length) : 0,
  );
  const [fade, setFade] = useState(false);
  const currentUrl = urls[idx] ?? "";
  const fullscreen = isFullscreenAdvert(currentUrl);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setPortalRoot(portalRef?.current ?? null);
  }, [portalRef, fullscreen]);

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

  if (urls.length === 0) return null;

  const imageClass = fade ? styles.imageFade : styles.image;

  const image = (
    <img
      key={currentUrl}
      className={imageClass}
      src={currentUrl}
      alt=""
      loading="eager"
    />
  );

  if (fullscreen && portalRoot) {
    return createPortal(
      <div className={styles.fullscreen} aria-label="Adverts">
        {image}
      </div>,
      portalRoot,
    );
  }

  if (fullscreen) {
    return null;
  }

  return (
    <div className={styles.root} aria-label="Adverts">
      {image}
    </div>
  );
}

