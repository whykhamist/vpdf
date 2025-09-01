import { fileURLToPath, URL } from "node:url";
import { defineConfig, mergeConfig } from "vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
// import vueDevTools from "vite-plugin-vue-devtools";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import viteCommon from "../../vite.config";

// https://vite.dev/config/
export default mergeConfig(
  viteCommon,
  defineConfig({
    plugins: [
      vueJsx(),
      // vueDevTools(),
      AutoImport({
        imports: ["vue", "vue-router"],
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/, // .md
        ],
        vueTemplate: true,
        dts: true,
        dirs: ["./src/**/*"],
      }),
      Components({
        dts: true,
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [
          (name) => {
            // Where `componentName` is always CapitalCase
            if (["VPdf", "VPdfPage", "VPdfViewer"].includes(name)) {
              return { name, from: "@whykhamist/vpdf" };
            }
          },
        ],
      }),
    ],
    server: {
      open: true,
      host: true,
      port: 8090,
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@files": fileURLToPath(new URL("../../files", import.meta.url)),
        "@whykhamist/vpdf": fileURLToPath(
          new URL("../vpdf/src", import.meta.url),
        ),
      },
    },
  }),
);
