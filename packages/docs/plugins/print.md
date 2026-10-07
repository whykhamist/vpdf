# Print plugin

Package: `@whykhamist/vpdf-plugin-print` (`3.0.0`).

Peers: `@whykhamist/vpdf`, `vue@^3.5`, `pdfjs-dist@6.3.289`.

## Install

```bash
npm install @whykhamist/vpdf-plugin-print @whykhamist/vpdf pdfjs-dist@6.3.289
```

Register the plugin to show the Print control. Disable with `plugins.enabled['vpdf.print'] = false`.

```ts
import { VPdfPrintPlugin } from "@whykhamist/vpdf-plugin-print";

const plugins = {
  plugins: [VPdfPrintPlugin({ dpi: 150, title: "My Doc" })],
};
```

The package exports `VPdfPrintPlugin` only (no `createPrintPlugin` alias).

## Options

[`VPdfPrintPluginOptions`](/plugins/types/print#vpdfprintpluginoptions) and [`PrintPagesOptions`](/plugins/types/print#printpagesoptions):

| Option | Default | Role |
| --- | --- | --- |
| `dpi` | `150` | Raster scale |
| `title` | `state.meta.title` then `"Document"` | Print document title |

## UI

| Item | Value |
| --- | --- |
| Id | `vpdf.print` |
| Toolbar | `placement: 'end'`, `order: 50`, icon `print` |
| Disabled | already printing, `loadState !== 'ready'`, or no document |
| Progress | `registerControl` in `page-overlay-host`; cancel aborts |

Abort also runs when `ctx.signal` fires (document close / unmount).

## How print works

1. Opens a **hidden iframe** (not a popup) as the print target.
2. Copies parent `link[rel=stylesheet]` and `style` nodes into that document.
3. Renders each page with PDF.js `intent: 'print'` and `annotationMode` `ENABLE_STORAGE` (includes stored annotations).
4. XFA pages render HTML via `XfaLayer` (`.vpdf-print-page`), not canvas snapshots.
5. Calls `print()` after every page is ready.

Default print uses that hidden iframe. If the iframe document is missing, print throws `[vpdf] print frame is unavailable`.

If you pass a custom `openWindow` to `printPdfDocument` and it returns `null`, print throws `[vpdf] print popup was blocked`.

Render failures close the target and skip `print()`. Abort cancels in-flight render and does not call `print()`.

Progress callbacks: `{ page: 0..N, total }` per page.

## Programmatic API

```ts
await printPdfDocument(pdfDocumentProxy, {
  dpi: 150,
  title: "Report",
  signal: abort.signal,
  onProgress: ({ page, total }) => {},
});
```
