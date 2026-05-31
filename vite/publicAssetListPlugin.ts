import { join } from "node:path";
import type { Plugin } from "vite";
import { listPublicAssetUrls } from "./listPublicAssets";

const VIRTUAL_PREFIX = "virtual:public-asset-list/";
const RESOLVED_PREFIX = "\0virtual:public-asset-list:";

export function publicAssetListPlugin(subdirs: string[]): Plugin {
  let root = process.cwd();
  const subdirSet = new Set(subdirs);

  const resolveVirtualId = (subdir: string) => `${RESOLVED_PREFIX}${subdir}`;
  const virtualId = (subdir: string) => `${VIRTUAL_PREFIX}${subdir}`;

  return {
    name: "public-asset-list",

    configResolved(config) {
      root = config.root;
    },

    configureServer(server) {
      for (const subdir of subdirs) {
        server.watcher.add(join(root, "public", subdir));
      }

      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (!url.startsWith("/__asset-list/")) {
          next();
          return;
        }

        const subdir = decodeURIComponent(url.slice("/__asset-list/".length));
        if (!subdirSet.has(subdir)) {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }

        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify(listPublicAssetUrls(root, subdir)));
      });
    },

    resolveId(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        return resolveVirtualId(id.slice(VIRTUAL_PREFIX.length));
      }
    },

    load(id) {
      if (!id.startsWith(RESOLVED_PREFIX)) return;

      const subdir = id.slice(RESOLVED_PREFIX.length);
      if (!subdirSet.has(subdir)) return;

      const urls = listPublicAssetUrls(root, subdir);
      return `export default ${JSON.stringify(urls)};`;
    },

    handleHotUpdate({ file, server }) {
      for (const subdir of subdirs) {
        const dir = join(root, "public", subdir);
        if (file !== dir && !file.startsWith(`${dir}/`)) continue;

        server.ws.send({
          type: "custom",
          event: "public-assets-changed",
          data: { subdir },
        });

        return subdirs
          .map((s) => server.moduleGraph.getModuleById(resolveVirtualId(s)))
          .filter((m): m is NonNullable<typeof m> => m != null);
      }
    },
  };
}
