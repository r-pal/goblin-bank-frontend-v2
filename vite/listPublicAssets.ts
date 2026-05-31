import { existsSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

/** Root-relative URLs for image files in `public/<subdir>/`. */
export function listPublicAssetUrls(root: string, subdir: string): string[] {
  const dir = join(root, "public", subdir);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((name) => !name.startsWith(".") && IMAGE_EXTS.has(extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `/${subdir}/${name}`);
}
