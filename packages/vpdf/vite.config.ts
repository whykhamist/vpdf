import { fileURLToPath, URL } from "node:url";
import { defineConfig, mergeConfig, UserConfig } from "vite";
import vitecommon from "../../vite.config";

// https://vite.dev/config/
export default mergeConfig(
  vitecommon,
  defineConfig({
    build: {
      // sourcemap: true,

      lib: {
        entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
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
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  } satisfies UserConfig),
);
