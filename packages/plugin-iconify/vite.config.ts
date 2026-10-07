import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
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
      name: 'VPdfPluginIconify',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', '@whykhamist/vpdf', '@iconify/vue', '@iconify/vue/offline'],
      output: {
        assetFileNames: (asset) => {
          const css = asset.names?.some((name) => name.endsWith('.css'))
            || asset.name?.endsWith('.css')
          return css ? 'style.css' : 'assets/[name][extname]'
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
