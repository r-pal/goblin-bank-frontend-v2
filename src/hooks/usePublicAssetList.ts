import { useCallback, useEffect, useState } from "react";
import panelUrls from "virtual:public-asset-list/assets/panels";
import tvFloatUrls from "virtual:public-asset-list/assets/tv-float";

type Subdir = "assets/panels" | "assets/tv-float";

const BUILD_URLS: Record<Subdir, readonly string[]> = {
  "assets/panels": panelUrls,
  "assets/tv-float": tvFloatUrls,
};

/** Image URLs under `public/<subdir>/`; rescans in dev when files are added or removed. */
export function usePublicAssetList(subdir: Subdir): readonly string[] {
  const [urls, setUrls] = useState<readonly string[]>(() =>
    import.meta.env.DEV ? [] : BUILD_URLS[subdir],
  );

  const refresh = useCallback(() => {
    if (!import.meta.env.DEV) return;

    fetch(`/__asset-list/${encodeURI(subdir)}`)
      .then((r) => (r.ok ? r.json() : BUILD_URLS[subdir]))
      .then((list: string[]) => setUrls(list))
      .catch(() => setUrls([...BUILD_URLS[subdir]]));
  }, [subdir]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    refresh();

    const hot = import.meta.hot;
    if (!hot) return;

    const onChange = (payload: { subdir?: string }) => {
      if (!payload.subdir || payload.subdir === subdir) refresh();
    };

    hot.on("public-assets-changed", onChange);
    return () => hot.off("public-assets-changed", onChange);
  }, [subdir, refresh]);

  if (import.meta.env.DEV) {
    return urls.length > 0 ? urls : BUILD_URLS[subdir];
  }

  return BUILD_URLS[subdir];
}
