import { defineConfig } from "vite";
import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "tailwindcss";

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
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [vue()],
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
});
