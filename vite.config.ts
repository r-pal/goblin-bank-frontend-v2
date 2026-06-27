import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { localDevAllowedHosts, localDevNamePlugin } from "./vite/localDevNamePlugin";
import { publicAssetListPlugin } from "./vite/publicAssetListPlugin";

export default defineConfig({
  plugins: [
    react(),
    publicAssetListPlugin(["assets/panels", "assets/tv-float"]),
    localDevNamePlugin(),
  ],
  server: {
    host: "0.0.0.0",
    port: 1234,
    strictPort: true,
    allowedHosts: localDevAllowedHosts(),
    proxy: {
      "/api": "http://127.0.0.1:4000",
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 1234,
    strictPort: true,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
