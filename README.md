# @whykhamist/vpdf

Production-ready Vue 3 + TypeScript PDF viewer built on [PDF.js](https://mozilla.github.io/pdf.js/), packaged as an npm workspaces monorepo with a playground app.

## Packages

| Package | Path | Purpose |
| --- | --- | --- |
| [`@whykhamist/vpdf`](packages/vpdf/README.md) | `packages/vpdf` | Viewer core, generic plugin hosts, default built-in controls |
| [`@whykhamist/vpdf-plugin-open`](packages/plugin-open/README.md) | `packages/plugin-open` | Opt-in open local PDF control |
| [`@whykhamist/vpdf-plugin-page-layout`](packages/plugin-page-layout/README.md) | `packages/plugin-page-layout` | Opt-in page layout dropdown |
| [`@whykhamist/vpdf-plugin-print`](packages/plugin-print/README.md) | `packages/plugin-print` | Opt-in print-to-pages plugin |
| [`@whykhamist/vpdf-plugin-iconify`](packages/plugin-iconify/README.md) | `packages/plugin-iconify` | Opt-in Iconify renderer with Lucide chrome and vscode-icons file glyphs |
| [`@whykhamist/vpdf-plugin-xfa-thumbnail-raster`](packages/plugin-xfa-thumbnail-raster/README.md) | `packages/plugin-xfa-thumbnail-raster` | Opt-in html2canvas XFA thumbnail rasterizer |
| [`@vpdf/playground`](packages/playground/README.md) | `packages/playground` | Local harness for the library |
| [`@vpdf/docs`](packages/docs/README.md) | `packages/docs` | VitePress documentation site |

Host-app install and API docs: [`packages/vpdf`](packages/vpdf/README.md). Opt-in plugins have their own READMEs.

Full site: [`packages/docs`](packages/docs/README.md). Local: `npm run docs:dev` → http://localhost:5174/vpdf/. GitHub Pages publishes from `main` to `/vpdf/`.

Release notes: [HISTORY.md](HISTORY.md).

## Quick start

```bash
npm install
npm run dev
npm run docs:dev
```

Playground: http://localhost:5173  
Docs: http://localhost:5174/vpdf/

```bash
npm run build
npm test
npm run typecheck
```
