# @whykhamist/vpdf-plugin-xfa-thumbnail-raster

[XFA thumbnail raster plugin](/plugins/xfa-thumbnail-raster) changelog. Peer: `@whykhamist/vpdf@3.0.0`.

## 3.0.0

2026-10-07. First published version.

- Factory: `createXfaThumbnailRasterPlugin` (`VPdfXfaThumbnailRasterPlugin` alias).
- Plugin id: `vpdf.xfa-thumbnail-raster`.
- Rasterizes XFA sidebar thumbnails with `html2canvas`. Non-XFA pages still use PDF.js canvas rendering.
- Requires `features.xfa: true` (default) and the thumbnails sidebar.
