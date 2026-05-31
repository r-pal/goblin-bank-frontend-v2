import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { publicAssetListPlugin } from "./vite/publicAssetListPlugin";

export default defineConfig({
  plugins: [
    react(),
    publicAssetListPlugin(["assets/panels", "assets/tv-float"]),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
