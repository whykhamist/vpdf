import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      outDir: 'dist',
      rollupTypes: false,
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'VPdfPluginXfaThumbnailRaster',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', '@whykhamist/vpdf', 'html2canvas'],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
