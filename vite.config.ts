import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import type { PreRenderedAsset } from "rollup";

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        "top-level-await": true,
      },
    },
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // entryFileNames: `assets/[hash].js`,
        chunkFileNames: `assets/[hash].js`,
        assetFileNames: (assetInfo: PreRenderedAsset) => {
          if (assetInfo.names?.[0].endsWith(".css")) {
            return "assets/style.css";
          }
          return assetInfo.names?.[0];
        },
      },
    },
  },
  plugins: [vue(), tailwindcss()],
});
