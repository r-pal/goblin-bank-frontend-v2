/** Encode root-relative public URLs (spaces, etc.) for img src. */
export function publicAssetSrc(url: string): string {
  return encodeURI(url);
}
