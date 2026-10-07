import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
      '@whykhamist/vpdf': resolve(import.meta.dirname, '../vpdf/src/index.ts'),
      '@whykhamist/vpdf-plugin-page-layout': resolve(
        import.meta.dirname,
        '../plugin-page-layout/src/index.ts',
      ),
      '@whykhamist/vpdf-plugin-print': resolve(import.meta.dirname, '../plugin-print/src/index.ts'),
      '@whykhamist/vpdf-plugin-open': resolve(import.meta.dirname, '../plugin-open/src/index.ts'),
      '@whykhamist/vpdf-plugin-iconify': resolve(import.meta.dirname, '../plugin-iconify/src/index.ts'),
      '@whykhamist/vpdf-plugin-xfa-thumbnail-raster': resolve(
        import.meta.dirname,
        '../plugin-xfa-thumbnail-raster/src/index.ts',
      ),
    },
  },
  server: {
    port: 5173,
    fs: {
      allow: ['../..'],
    },
  },
  optimizeDeps: {
    exclude: [
      '@whykhamist/vpdf',
      '@whykhamist/vpdf-plugin-page-layout',
      '@whykhamist/vpdf-plugin-print',
      '@whykhamist/vpdf-plugin-open',
      '@whykhamist/vpdf-plugin-iconify',
      '@whykhamist/vpdf-plugin-xfa-thumbnail-raster',
    ],
    include: ['pdfjs-dist/legacy/build/pdf.mjs', 'pdfjs-dist/legacy/web/pdf_viewer.mjs'],
  },
  worker: {
    format: 'es',
  },
})
