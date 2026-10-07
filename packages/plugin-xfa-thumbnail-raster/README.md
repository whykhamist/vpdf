# @whykhamist/vpdf-plugin-xfa-thumbnail-raster

Opt-in package. Register it to rasterize XFA sidebar thumbnails with `html2canvas` instead of the default inert HTML preview. Non-XFA pages still use PDF.js canvas rendering.

```bash
npm install @whykhamist/vpdf-plugin-xfa-thumbnail-raster @whykhamist/vpdf
```

```ts
import { createXfaThumbnailRasterPlugin } from '@whykhamist/vpdf-plugin-xfa-thumbnail-raster'

const plugins = {
  plugins: [createXfaThumbnailRasterPlugin()],
}
```
