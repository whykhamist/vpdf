# @whykhamist/vpdf-plugin-iconify

Opt-in package. Register it to replace viewer UI icons with Iconify SVGs. Lucide icons (toolbar slots) and vscode-icons file-type glyphs (attachment rows) are bundled and registered locally. The plugin uses `@iconify/vue/offline` by default, so it does **not** fetch from `api.iconify.design`. String names like `lucide:search` only render if they are in local Iconify storage.

```bash
npm install @whykhamist/vpdf-plugin-iconify @whykhamist/vpdf
```

Override a slot with raw icon data, or register extra sets via `iconify.collections` / `iconify.icons` (for example from `@iconify-json/*`). Iconify storage is process-global; per-viewer differences still come from the slot `icons` map.

Attachment rows use `file:<ext>` (or `file:generic`). Known extensions map to vscode-icons (`file-type-js`, `file-type-pdf2`, …); anything else uses `default-file`. Set `fileIcons: false` to keep the list text-only. Category classes (`vpdf-file-icon--pdf`, …) stay on the icon for hooks. The plugin stylesheet (`@whykhamist/vpdf-plugin-iconify/style.css`) is also pulled in when a bundler follows the plugin JS import.

```ts
import { createIconifyPlugin } from '@whykhamist/vpdf-plugin-iconify'
import '@whykhamist/vpdf-plugin-iconify/style.css'
import { icons as mdi } from '@iconify-json/mdi'

const plugins = {
  plugins: [
    createIconifyPlugin({
      fileIcons: true,
      icons: {
        search: 'lucide:search',
        download: {
          body: '<path fill="currentColor" d="M5 20h14v-2H5z"/>',
          width: 24,
          height: 24,
        },
        'file:pdf': 'custom:pdf',
      },
      iconify: {
        collections: [mdi],
        icons: {
          'custom:pdf': {
            body: '<path fill="currentColor" d="M5 20h14v-2H5z"/>',
            width: 24,
            height: 24,
          },
        },
        // Opt in to remote Iconify (or a self-hosted API) only when you need it:
        // api: { providers: { '': { resources: ['https://your-iconify-api'] } } },
      },
    }),
  ],
}
```

| Slot | Default Lucide icon |
| --- | --- |
| `sidebar` | `panel-left` |
| `previousPage` / `nextPage` | `chevron-left` / `chevron-right` |
| `zoomIn` / `zoomOut` | `zoom-in` / `zoom-out` |
| `rotate` | `rotate-cw` |
| `search` | `search` |
| `searchPrevious` / `searchNext` / `searchClose` | `chevron-up` / `chevron-down` / `x` |
| `highlight` / `freetext` / `ink` / `stamp` | `highlighter` / `type` / `pencil` / `stamp` |
| `download` / `save` | `download` / `save` |
| `more` | `ellipsis` |
| `thumbnails` / `outline` / `attachments` | `layout-grid` / `list-tree` / `paperclip` |
| `open` / `print` | `folder-open` / `printer` |
| `outlineExpand` / `outlineCollapse` | `chevron-right` / `chevron-down` |
| `editorDelete` | `trash-2` |

Disabling `vpdf.iconify` restores the built-in glyph fallbacks. The renderer is per viewer instance, so two viewers can use different icon maps.
