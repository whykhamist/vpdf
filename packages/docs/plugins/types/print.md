# Print plugin types

Package: `@whykhamist/vpdf-plugin-print`. See [Print plugin](/plugins/print).

## VPdfPrintPluginOptions

| Property | Type | Description |
| --- | --- | --- |
| `dpi` | `number` | Raster scale; default `150` |
| `title` | `string` | Print document title; default from `state.meta.title` or `"Document"` |

## PrintPagesOptions

Arguments to `printPdfDocument()`.

| Property | Type | Description |
| --- | --- | --- |
| `dpi` | `number` | Raster DPI |
| `title` | `string` | Document title |
| `signal` | `AbortSignal` | Cancel in-flight render |
| `onProgress` | `(progress: PrintProgress) => void` | Per-page progress |
| `openWindow` | `() => Window \| null` | Custom print target |

## PrintProgress

| Property | Type | Description |
| --- | --- | --- |
| `page` | `number` | Current page index |
| `total` | `number` | Total pages |
