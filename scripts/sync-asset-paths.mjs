/**
 * Optional: regenerate static fallbacks in src/constants/ (not required for dev).
 * Panels and tv-float are discovered automatically via vite/publicAssetListPlugin.
 */
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

const TARGETS = [
  {
    subdir: "assets/tv-float",
    outFile: "src/constants/tvFloatPaths.ts",
    exportName: "TV_FLOAT_URLS",
  },
  {
    subdir: "assets/panels",
    outFile: "src/constants/advertPaths.ts",
    exportName: "ADVERT_URLS",
  },
];

function listUrls(subdir) {
  const dir = join(process.cwd(), "public", subdir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => !name.startsWith(".") && IMAGE_EXTS.has(extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `/${subdir}/${name}`);
}

for (const { subdir, outFile, exportName } of TARGETS) {
  const urls = listUrls(subdir);
  const source = `// Optional snapshot from npm run sync:assets — app uses virtual:public-asset-list at runtime
/** Root-relative URLs for files in public/${subdir}/ */
export const ${exportName}: readonly string[] = ${JSON.stringify(urls, null, 2)};
`;
  writeFileSync(join(process.cwd(), outFile), source);
  console.log(`Wrote ${urls.length} path(s) to ${outFile}`);
}
