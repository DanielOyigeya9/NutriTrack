import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

const precacheManifest = {
  name: "nutritrack-precache-manifest",
  generateBundle(
    _options: unknown,
    bundle: Record<string, { type: string }>,
  ) {
    const assets = Object.keys(bundle)
      .filter((fileName) => /\.(js|css)$/.test(fileName))
      .map((fileName) => `/${fileName}`);

    this.emitFile({
      type: "asset",
      fileName: "precache-assets.json",
      source: JSON.stringify(assets),
    });
  },
};

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths(),
    precacheManifest,
  ],
})
