# XFA thumbnail raster plugin

Package: `@whykhamist/vpdf-plugin-xfa-thumbnail-raster` (`3.0.0`).

Rasterizes **XFA** sidebar thumbnails with `html2canvas`. Non-XFA pages still use PDF.js canvas rendering.

## Install

```bash
npm install @whykhamist/vpdf-plugin-xfa-thumbnail-raster @whykhamist/vpdf
```

```ts
import { createXfaThumbnailRasterPlugin } from "@whykhamist/vpdf-plugin-xfa-thumbnail-raster";

const plugins = {
  plugins: [createXfaThumbnailRasterPlugin()],
};
```

Id: `vpdf.xfa-thumbnail-raster`. Alias: `VPdfXfaThumbnailRasterPlugin`.

Requires `features.xfa: true` (default) and the thumbnails sidebar.

## Behavior

**Without the plugin:** XFA thumbnails render an inert HTML preview (`.vpdf-thumb-xfa`); the canvas stays hidden.

**With the plugin:** that HTML is captured via html2canvas (`scale: pixelRatio`, `useCORS: true`, `backgroundColor: null`) and painted onto the thumbnail canvas.

The plugin calls `ctx.registerXfaThumbnailRasterizer`. Last registered rasterizer wins.

Standalone helpers: `loadHtml2Canvas()`, `rasterizeXfaThumbnail(params, html2canvas)`.

Params ([`VPdfXfaThumbnailRasterizeParams`](/plugins/types/#vpdfxfathumbnailrasterizeparams)): `{ source, canvas, cssWidth, cssHeight, pixelRatio }`.

## Caveats

- Only XFA thumbnail cells change
- `html2canvas` is a direct dependency (size and performance)
- CORS / external assets in XFA forms can still fail
- No toolbar UI
- `html2canvas` on the plugin options object is an **@internal** test hook
