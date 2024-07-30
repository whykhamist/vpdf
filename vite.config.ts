import { defineConfig, mergeConfig } from "vite";
import { resolve } from "node:path";
import viteCommon from "./vite.common";

// https://vitejs.dev/config/
export default mergeConfig(
  viteCommon,
  defineConfig({
    build: {
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, "./src/index.ts"),
        name: "@whykhamist/vpdf",
        fileName: "index",
      },

      rollupOptions: {
        external: ["vue", "pdfjs-dist", "tailwindcss"],
        output: {
          exports: "named",
          globals: {
            vue: "vue",
            "pdfjs-dist": "PDFJS",
            tailwindcss: "tailwindcss",
          },
        },
      },
    },
  })
);
