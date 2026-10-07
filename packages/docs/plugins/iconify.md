# Iconify plugin

Package: `@whykhamist/vpdf-plugin-iconify` (`3.0.0`).

Replaces viewer UI icons with Iconify SVGs. Lucide icons (toolbar slots) and vscode-icons file-type glyphs (attachments) are bundled locally.

Default runtime is `@iconify/vue/offline` — **no** network to `api.iconify.design`. String names such as `lucide:search` only render if they are in local Iconify storage.

## Install

```bash
npm install @whykhamist/vpdf-plugin-iconify @whykhamist/vpdf
```

```ts
import { createIconifyPlugin } from "@whykhamist/vpdf-plugin-iconify";
import "@whykhamist/vpdf-plugin-iconify/style.css";

const plugins = {
  plugins: [createIconifyPlugin()],
};
```

The plugin JS also imports the stylesheet as a side effect. Import `style.css` explicitly in production bundlers that do not follow that import.

Id: `vpdf.iconify`. Alias: `VPdfIconifyPlugin`.

## Options

[`VPdfIconifyPluginOptions`](/plugins/types/iconify#vpdficonifypluginoptions):

```ts
VPdfIconifyPlugin({
  fileIcons: true,
  icons: {
    search: "lucide:search",
    download: {
      body: '<path fill="currentColor" d="M5 20h14v-2H5z"/>',
      width: 24,
      height: 24,
    },
    "file:pdf": "custom:pdf",
  },
  iconify: {
    collections: [mdi],
    icons: {
      "custom:pdf": {
        body: '<path fill="currentColor" d="M5 20h14v-2H5z"/>',
        width: 24,
        height: 24,
      },
    },
    // Remote / self-hosted API only when needed:
    // api: { providers: { "": { resources: ["https://your-iconify-api"] } } },
  },
});
```

| Option | Default | Role |
| --- | --- | --- |
| `icons` | Lucide defaults | Per-slot overrides |
| `fileIcons` | `true` | Map `file:<ext>` to vscode-icons |
| `iconify.collections` / `iconify.icons` | — | Extra local registrations |
| `iconify.api` | `false` (offline) | Object opts into `@iconify/vue` + remote resolution |

## Default Lucide slots

| Slot | Icon |
| --- | --- |
| `sidebar` | `panel-left` |
| `previousPage` / `nextPage` | `chevron-left` / `chevron-right` |
| `zoomIn` / `zoomOut` | `zoom-in` / `zoom-out` |
| `rotate` | `rotate-cw` |
| `search` | `search` |
| `searchPrevious` / `searchNext` / `searchClose` | `chevron-up` / `chevron-down` / `x` |
| `searchMore` | `ellipsis` |
| `highlight` / `freetext` / `ink` / `stamp` | `highlighter` / `type` / `pencil` / `stamp` |
| `download` / `save` | `download` / `save` |
| `more` | `ellipsis` |
| `thumbnails` / `outline` / `attachments` | `layout-grid` / `list-tree` / `paperclip` |
| `open` / `print` | `folder-open` / `printer` |
| `outlineExpand` / `outlineCollapse` | `chevron-right` / `chevron-down` |
| `editorDelete` | `trash-2` |
| `properties` | `info` |

See [Icons](/guide/icons) for the full `VPDF_ICON_SLOTS` list.

## File icons

Attachment rows use `file:<ext>` or `file:generic`. Known extensions map to vscode-icons (`file-type-js`, `file-type-pdf2`, …). Anything else uses `default-file`. `fileIcons: false` keeps the list text-only.

Category classes (`vpdf-file-icon`, `vpdf-file-icon--pdf`, …) stay on the icon. A custom `file:pdf` override skips the category class.

## Isolation

The renderer is per `PluginManager` / viewer. Iconify **storage** is process-global; per-viewer differences still come from each plugin’s `icons` map.

Unknown names go through the Iconify renderer first. If that renderer returns nothing, `VPdfIcon` paints the `fallback` SVG (usually `VPDF_ICON_FALLBACKS`). Disabling `vpdf.iconify` restores those fallbacks for that viewer.
