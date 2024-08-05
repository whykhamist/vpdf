import { defineConfig, mergeConfig } from "vite";
import { resolve } from "node:path";
import viteCommon from "./vite.common";

// https://vitejs.dev/config/
export default mergeConfig(
  viteCommon,
  defineConfig({
    base: "/vpdf/",
    optimizeDeps: {
      include: ["tailwind.config.ts"],
    },
    resolve: {
      alias: {
        "@whykhamist/vpdf": resolve(__dirname, "./src"),
        "@files": resolve(__dirname, "preview/files"),
      },
    },
    build: {
      sourcemap: false,
      outDir: "docs",
    },
    server: {
      port: 5173,
      open: `http://localhost:5173`, // opens browser window automatically
    },
    css: {
      devSourcemap: true,
    },
  })
);
