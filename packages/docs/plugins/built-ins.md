# Built-in plugins

Factories and ids are exported from `@whykhamist/vpdf`. The viewer always starts from `createBuiltinPlugins()`, then merges `plugins.plugins`. You rarely call `createBuiltinPlugins` yourself.

```ts
import {
  VPDF_BUILTIN_PLUGIN_IDS,
  VpdfAnnotationsPlugin,
  VPdfAttachmentsPlugin,
  VPdfDocumentPropertiesPlugin,
  VPdfDownloadPlugin,
  VPdfNavigationPlugin,
  VPdfOutlinePlugin,
  VPdfRotatePlugin,
  VPdfSearchPlugin,
  VPdfThumbnailsPlugin,
  VPdfZoomPlugin,
  createBuiltinPlugins,
} from "@whykhamist/vpdf";
```

::: warning
A user plugin with the same `id` as a built-in plugin replaces the built-in definition.
:::

The annotations factory is exported as `VpdfAnnotationsPlugin` (lowercase `pdf`). That spelling is the public name.

## Ids

| Constant | Id | What it registers | Toolbar / feature gates |
| --- | --- | --- | --- |
| `navigation` | `vpdf.navigation` | Sidebar toggle, page nav, paging keys | `toolbar.sidebar`, `toolbar.pageNav` |
| `zoom` | `vpdf.zoom` | Zoom select, ±, wheel/pinch, zoom keys | `toolbar.zoom` |
| `rotate` | `vpdf.rotate` | Rotate clockwise | `toolbar.rotate` |
| `search` | `vpdf.search` | Find bar, Ctrl/Cmd+F | `toolbar.search` **and** `features.search` |
| `annotations` | `vpdf.annotations` | Highlight / text / ink / stamp | `toolbar.annotations` **and** `features.annotations` |
| `download` | `vpdf.download` | Download / save modified | `toolbar.download` |
| `thumbnails` | `vpdf.thumbnails` | Pages sidebar | `features.thumbnails` |
| `outline` | `vpdf.outline` | Outline sidebar | `features.outline` |
| `attachments` | `vpdf.attachments` | Files sidebar; may `emit('onAttachmentDownload')` | `features.attachments` |
| `documentProperties` | `vpdf.documentProperties` | Overflow “Properties” + modal | `toolbar.documentProperties` |

Registration order is the table order. That order is also shortcut match order among built-ins.

These features are plugins so hosts can disable or replace one surface without forking the viewer. Core still owns PDF.js engine work; plugins own the viewer UI and gestures.

## Disable

Set `plugins.enabled[id]` to `false` (register time) or call `setEnabled(id, false)` at runtime to deactivate the plugin.

Use the matching `toolbar` / `features` flag to hide chrome while the plugin stays loaded. Built-ins that check those flags also skip their shortcuts and gestures. See [Features and toolbar](/guide/features#built-in-plugins-honor-both).

```ts
const plugins = {
  enabled: {
    [VPDF_BUILTIN_PLUGIN_IDS.download]: false,
  },
};
```

## Replace

Register a plugin with the same id. The annotations factory is the supported way to swap the editor component:

```ts
VpdfAnnotationsPlugin({ editorComponent: CustomEditor });
```

To replace zoom entirely, pass a definition whose `id` is `vpdf.zoom` (or `VPDF_BUILTIN_PLUGIN_IDS.zoom`). `mergeViewerPlugins` does not merge `setup` with the original.

## Not built-in

These are **not** created by `createBuiltinPlugins()`. Install the package and pass the factory in `plugins.plugins`:

| Package | Plugin id | Docs |
| --- | --- | --- |
| `@whykhamist/vpdf-plugin-open` | `vpdf.open` | [Open](/plugins/open) |
| `@whykhamist/vpdf-plugin-print` | `vpdf.print` | [Print](/plugins/print) |
| `@whykhamist/vpdf-plugin-page-layout` | `page-layout` (no `vpdf.` prefix) | [Page layout](/plugins/page-layout) |
| `@whykhamist/vpdf-plugin-iconify` | `vpdf.iconify` | [Iconify](/plugins/iconify) |
| `@whykhamist/vpdf-plugin-xfa-thumbnail-raster` | `vpdf.xfa-thumbnail-raster` | [XFA thumbnail raster](/plugins/xfa-thumbnail-raster) |

Use `'page-layout'` in `plugins.enabled`, not `vpdf.page-layout`.
