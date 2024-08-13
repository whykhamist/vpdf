import { fileURLToPath, URL } from "url";
import { defineConfig, mergeConfig } from "vite";
import viteCommon from "../../vite.config";

// https://vitejs.dev/config/
export default mergeConfig(
  viteCommon,
  defineConfig({
    base: "/vpdf/",
    optimizeDeps: {
      include: ["tailwind.config.ts"],
    },
    resolve: {
      alias: [
        {
          find: "@vue/runtime-core",
          replacement: "@vue/runtime-core/dist/runtime-core.esm-bundler.js",
        },
        // {
        //   find: "@",
        //   replacement: fileURLToPath(new URL("./src", import.meta.url)),
        // },
        {
          find: "@files",
          replacement: fileURLToPath(new URL("./files", import.meta.url)),
        },
        {
          find: "@whykhamist/vpdf",
          replacement: fileURLToPath(new URL("../vpdf/src", import.meta.url)),
        },
      ],
    },
    build: {
      sourcemap: false,
      outDir: "../../docs",
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
