import { useId } from "react";
import { publicAssetSrc } from "../utils/publicAssetSrc";
import styles from "./TvGoblinFloater.module.css";

const GOBLIN_SRC = publicAssetSrc(
  "/assets/tv-float-main/Goblin_illustration_from_19th_century.png",
);

export function TvGoblinFloater() {
  const rawId = useId();
  const maskId = `goblin-lines-${rawId.replace(/:/g, "")}`;
  const invertFilterId = `${maskId}-invert`;

  return (
    <div className={styles.stage} aria-hidden>
      <svg className={styles.svgDefs} aria-hidden>
        <defs>
          <filter id={invertFilterId} colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"
            />
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.35" intercept="-0.12" />
              <feFuncG type="linear" slope="1.35" intercept="-0.12" />
              <feFuncB type="linear" slope="1.35" intercept="-0.12" />
            </feComponentTransfer>
          </filter>
          <mask
            id={maskId}
            maskUnits="objectBoundingBox"
            maskContentUnits="objectBoundingBox"
          >
            <image
              href={GOBLIN_SRC}
              width="1"
              height="1"
              preserveAspectRatio="xMidYMid meet"
              filter={`url(#${invertFilterId})`}
            />
          </mask>
        </defs>
      </svg>

      <div className={styles.drift}>
        <div className={styles.motion}>
          <div
            className={styles.figure}
            style={{
              WebkitMaskImage: `url(#${maskId})`,
              maskImage: `url(#${maskId})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
