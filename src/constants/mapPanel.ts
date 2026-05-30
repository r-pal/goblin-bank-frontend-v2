import { ADVERT_URLS } from "./advertPaths";

export function isMapPanelUrl(url: string): boolean {
  return /MAP(\s|%20)?2\.jpg$/i.test(url);
}

export const MAP_PANEL_URL = ADVERT_URLS.find(isMapPanelUrl) ?? null;
