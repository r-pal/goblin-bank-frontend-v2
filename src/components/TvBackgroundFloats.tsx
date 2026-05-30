import { useEffect, useRef, useState } from "react";
import { TV_FLOAT_URLS } from "../constants/tvFloatPaths";
import { publicAssetSrc } from "../utils/publicAssetSrc";
import styles from "./TvBackgroundFloats.module.css";

type Sprite = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  url: string;
};

function createSprites(urls: readonly string[], width: number, height: number): Sprite[] {
  if (urls.length === 0 || width <= 0 || height <= 0) return [];

  const count = Math.min(16, Math.max(10, urls.length * 3));
  return Array.from({ length: count }, (_, i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.44,
    vy: (Math.random() - 0.5) * 0.36,
    size: 56 + Math.random() * 130,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.01,
    url: urls[i % urls.length]!,
  }));
}

function stepSprite(s: Sprite, width: number, height: number): Sprite {
  let { x, y, rot } = s;
  x += s.vx;
  y += s.vy;
  rot += s.vr;

  const pad = s.size;
  if (x < -pad) x = width + pad;
  if (x > width + pad) x = -pad;
  if (y < -pad) y = height + pad;
  if (y > height + pad) y = -pad;

  return { ...s, x, y, rot };
}

export function TvBackgroundFloats() {
  const urls = TV_FLOAT_URLS;
  const layerRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef({ width: 0, height: 0 });
  const [sprites, setSprites] = useState<Sprite[]>([]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || urls.length === 0) {
      setSprites([]);
      return;
    }

    const layout = () => {
      const { width, height } = layer.getBoundingClientRect();
      boundsRef.current = { width, height };
      setSprites(createSprites(urls, width, height));
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(layer);

    return () => ro.disconnect();
  }, [urls]);

  useEffect(() => {
    if (sprites.length === 0) return;

    let frame = 0;
    const tick = () => {
      const { width, height } = boundsRef.current;
      if (width <= 0 || height <= 0) return;

      setSprites((prev) => prev.map((s) => stepSprite(s, width, height)));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [sprites.length]);

  return (
    <div ref={layerRef} className={styles.layer} aria-hidden>
      {sprites.map((s, i) => (
        <div
          key={`${s.url}-${i}`}
          className={styles.sprite}
          style={{
            width: s.size,
            height: s.size,
            transform: `translate3d(${s.x}px, ${s.y}px, 0) rotate(${s.rot}rad)`,
          }}
        >
          <div
            className={styles.floatArt}
            style={{
              WebkitMaskImage: `url("${publicAssetSrc(s.url)}")`,
              maskImage: `url("${publicAssetSrc(s.url)}")`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
