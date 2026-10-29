# vpdf-plugin-xfa-thumbnail-raster

> [@whykhamist/vpdf-plugin-xfa-thumbnail-raster](/plugins/xfa-thumbnail-raster)

## v3.0.1

> Released on October 29, 2026

### ✏️ Changed

- Updated the peer dependency version requirement in `package.json` from `3.0.0` to `^3.0.0` to allow compatible minor and patch versions.

## v3.0.0

> Released on October 7, 2026

### 🎉 First published version.

- Factory: `createXfaThumbnailRasterPlugin` (`VPdfXfaThumbnailRasterPlugin` alias).
- Plugin id: `vpdf.xfa-thumbnail-raster`.
- Rasterizes XFA sidebar thumbnails with `html2canvas`. Non-XFA pages still use PDF.js canvas rendering.
- Requires `features.xfa: true` (default) and the thumbnails sidebar.
