import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/vpdf/",
  optimizeDeps: {
    include: ["tailwind.config.ts"],
    esbuildOptions: {
      supported: {
        "top-level-await": true,
      },
    },
  },
  build: {
    sourcemap: false,
    emptyOutDir: true,
    outDir: "docs",
    rollupOptions: {
      output: {
        entryFileNames: `assets/[hash].js`,
        chunkFileNames: `assets/[hash].js`,
        assetFileNames: `assets/[hash].[ext]`,
      },
    },
  },
  server: {
    port: 5173,
    open: `http://localhost:5173`, // opens browser window automatically
  },
  plugins: [vue()],
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [tailwindcss],
    },
  },
});
