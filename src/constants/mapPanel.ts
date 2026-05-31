export function isMapPanelUrl(url: string): boolean {
  return /MAP(\s|%20)?2\.jpg$/i.test(url);
}

export function findMapPanelUrl(urls: readonly string[]): string | null {
  return urls.find(isMapPanelUrl) ?? null;
}
