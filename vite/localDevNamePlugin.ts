import { execSync } from "node:child_process";
import type { Plugin, ViteDevServer } from "vite";

const WANTED_NAME = process.env.LOCAL_DEV_NAME ?? "goblin-bank";

function readMacLocalHostName(): string | null {
  try {
    const name = execSync("scutil --get LocalHostName", { encoding: "utf8" }).trim();
    return name.length > 0 ? name : null;
  } catch {
    return null;
  }
}

function printFriendlyUrls(server: ViteDevServer) {
  const port = server.config.server.port ?? 1234;
  const macName = readMacLocalHostName();
  const logger = server.config.logger;

  if (macName) {
    logger.info(`  ➜  Friendly: http://${macName}.local:${port}/`, { clear: true });
    if (macName !== WANTED_NAME) {
      logger.info(
        `     (rename Local Hostname to "${WANTED_NAME}" in System Settings → General → Sharing for http://${WANTED_NAME}.local:${port}/)`,
        { clear: true },
      );
    }
  } else {
    logger.info(`  ➜  Friendly: http://${WANTED_NAME}.local:${port}/`, { clear: true });
    logger.info(
      `     (set Local Hostname to "${WANTED_NAME}" in System Settings → General → Sharing)`,
      { clear: true },
    );
  }
}

export function localDevNamePlugin(): Plugin {
  return {
    name: "goblin-local-dev-name",
    configureServer(server) {
      server.httpServer?.once("listening", () => printFriendlyUrls(server));
    },
  };
}

export function localDevAllowedHosts(): string[] {
  const macName = readMacLocalHostName();
  const hosts = new Set(["localhost", `${WANTED_NAME}.local`, ".local"]);
  if (macName) hosts.add(`${macName}.local`);
  return Array.from(hosts);
}
