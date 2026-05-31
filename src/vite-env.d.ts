/// <reference types="vite/client" />

declare module "virtual:public-asset-list/*" {
  const urls: readonly string[];
  export default urls;
}

interface ImportMetaHot {
  on(event: "public-assets-changed", callback: (data: { subdir: string }) => void): void;
  off(event: "public-assets-changed", callback: (data: { subdir: string }) => void): void;
}
