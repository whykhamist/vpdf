import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    dts({
      include: ['src'],
      outDir: 'dist',
      rollupTypes: true,
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'VPdf',
      formats: ['es'],
      fileName: 'vpdf',
    },
    rollupOptions: {
      external: ['vue', /^pdfjs-dist/],
      output: {
        assetFileNames: 'vpdf.[ext]',
        globals: {
          vue: 'Vue',
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
    emptyOutDir: true,
  },
  worker: {
    format: 'es',
  },
})
