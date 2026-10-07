# @whykhamist/vpdf

Production-ready Vue 3 + TypeScript PDF viewer built on [PDF.js](https://mozilla.github.io/pdf.js/).

## Install in a host app

```bash
npm install @whykhamist/vpdf pdfjs-dist@6.3.289 vue@^3.5
```

```ts
import { createApp } from 'vue'
import VPdf from '@whykhamist/vpdf'
import '@whykhamist/vpdf/style.css'

createApp(App).use(VPdf).mount('#app')
```

```vue
<script setup lang="ts">
import { VPdfViewer } from '@whykhamist/vpdf'
</script>

<template>
  <VPdfViewer
    src="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
    :options="{
      smoothJump: false,
      features: { textLayer: true, annotations: true, xfa: true, scripting: false },
      assets: {
        workerSrc: new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString(),
        cMapUrl: new URL('pdfjs-dist/cmaps/', import.meta.url).toString(),
        standardFontDataUrl: new URL('pdfjs-dist/standard_fonts/', import.meta.url).toString(),
      },
    }"
  />
</template>
```

Point `assets.workerSrc` at the **same** `pdfjs-dist` version used by `@whykhamist/vpdf` (pinned to `6.3.289`). Prefer the **legacy** worker for broader browser support:

```ts
workerSrc: new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).toString()
```

`@whykhamist/vpdf` loads `pdfjs-dist/legacy/*` so environments without `Map.prototype.getOrInsertComputed` (e.g. older Chromium / Firefox ESR) still work.

## Plugin hosts

Core ships generic hosts only: toolbar placements (`start`, `center`, `end`, `annotations`, `overflow`), sidebar panels, viewer-top/bottom controls, a global `page-overlay-host`, per-page overlays, and a single reader-scoped modal. Password, loading, and error UI stay in core. The password prompt uses the same modal shell and takes priority over plugin modals.

Default controls are auto-registered built-in plugins. They honor the existing `options.toolbar` and `options.features` flags, including `toolbar: false`.

| Built-in id | Control | Default visibility |
| --- | --- | --- |
| `vpdf.navigation` | Sidebar toggle, page nav, arrow/Page/Home/End shortcuts | on |
| `vpdf.zoom` | Zoom select, ±, Ctrl/Cmd+wheel, pinch, Ctrl/Cmd + +/−/0 | on |
| `vpdf.rotate` | Rotate clockwise | on |
| `vpdf.search` | Search toggle, find bar, Ctrl/Cmd+F | on (`toolbar.search` and `features.search`) |
| `vpdf.annotations` | Highlight / text / ink / stamp; themed per-annotation editor | on when annotations are enabled |
| `vpdf.download` | Download / save modified | on |
| `vpdf.thumbnails` | Pages sidebar | on (`features.thumbnails`) |
| `vpdf.outline` | Outline sidebar | on (`features.outline`) |
| `vpdf.attachments` | Files sidebar | on (`features.attachments`) |
| `vpdf.documentProperties` | Overflow “Document properties” modal | on (`toolbar.documentProperties`) |

The properties modal reads a **safe allowlist** from PDF.js when opened: title, author, subject, keywords, created, modified, application (creator), producer, PDF version, file size, first-page size (inches), tagged PDF, page count, and Fast Web View. Missing values show an em dash. File size prefers `Content-Length` / load progress and only calls `getDownloadInfo()` if those are unknown. It does **not** show source URLs, fingerprints, encryption details, permissions, scripts, raw XMP, or custom Info keys.

Hide it with `toolbar.documentProperties: false` or `plugins.enabled[VPDF_BUILTIN_PLUGIN_IDS.documentProperties] = false`.

### Annotation editor

Highlight, free text, and draw tools use Firefox-style toolbar dropdowns (mode-driven doorhangers). Selecting an annotation keeps that tool’s dropdown open. A themed Vue toolbar is also teleported into PDF.js’s `.editToolbar` for the selected annotation. PDF.js still owns resize handles, undo, and persistence.

| Tool | Toolbar dropdown | Inline editor |
| --- | --- | --- |
| Highlight | preset colors, thickness | same presets, delete |
| Free text | color picker, size | color picker, delete |
| Draw (ink) | color picker, thickness, opacity | color picker, delete |
| Stamp | — | delete |

Highlight colors use named presets (Yellow, Green, Blue, Pink, Red). Free text and draw use native color inputs. Override the inline toolbar by passing a Vue component that implements `VPdfAnnotationEditorProps` to the built-in plugin with the same id:

```vue
<script setup lang="ts">
import type { VPdfAnnotationEditorProps } from '@whykhamist/vpdf'

defineProps<VPdfAnnotationEditorProps>()
</script>

<template>
  <div role="toolbar" aria-label="Custom annotation editor">
    <button type="button" :disabled="!canDelete" @click="actions.deleteSelected()">
      Delete
    </button>
  </div>
</template>
```

```ts
import { VpdfAnnotationsPlugin } from '@whykhamist/vpdf'
import CustomEditor from './CustomEditor.vue'

const plugins = {
  plugins: [
    VpdfAnnotationsPlugin({
      editorComponent: CustomEditor,
    }),
  ],
}
```

A plugin with id `vpdf.annotations` replaces the built-in definition instead of registering twice. The delete action uses the `editorDelete` Iconify slot (Lucide `trash-2` by default).

Disable a built-in without removing the rest:

```ts
import { VPDF_BUILTIN_PLUGIN_IDS } from '@whykhamist/vpdf'

const plugins = {
  enabled: {
    [VPDF_BUILTIN_PLUGIN_IDS.download]: false,
  },
}
```

Open and print are implemented as controls in separate packages: [`@whykhamist/vpdf-plugin-open`](../plugin-open/README.md) and [`@whykhamist/vpdf-plugin-print`](../plugin-print/README.md). Register the plugin to show the control; disable with `plugins.enabled[id]`.

## Plugin registration

```ts
import type { VPdfPluginDefinition } from '@whykhamist/vpdf'

export const myPlugin: VPdfPluginDefinition = {
  id: 'my-plugin',
  setup(ctx) {
    ctx.registerToolbarItem({
      id: 'action',
      label: 'Action',
      onClick: () => ctx.openModal({
        component: MyModal,
      }),
    })
    ctx.registerPanel({
      id: 'panel',
      label: 'My Panel',
      component: MyPanel,
    })
    ctx.registerShortcut({
      id: 'next',
      key: ']',
      handler: () => ctx.controller.nextPage(),
    })
    ctx.on('onAnnotationChange', (event) => {
      // Persist via your backend — core does not invent storage
      console.log(event)
    })
  },
}
```

```vue
<VPdfViewer :src="src" :plugins="{ plugins: [myPlugin] }" />
```

User plugins register after built-ins. Enable/disable with `plugins.enabled[id]`. Toolbar items accept `placement` and `order`; omitted placement is `end`. Page overlay components receive `pageNumber`. `openModal` shows one reader-contained dialog (latest open wins); `closeModal` only dismisses the calling plugin’s modal. The host restores focus, traps Tab, and closes on Escape or backdrop click. Plugins can bind host-scoped listeners through `ctx.viewerHost` after the viewer mounts.

## Viewing gestures and shortcuts

Zooming is part of the built-in `vpdf.zoom` plugin. Disabling that plugin (or `toolbar.zoom: false`) removes the toolbar control, gestures, and zoom shortcuts together.

| Input | Action |
| --- | --- |
| Ctrl/Cmd + mouse wheel | Zoom toward the pointer (25%–800%) |
| Two-finger pinch | Zoom toward the pinch midpoint |
| Ctrl/Cmd + `+` or `=` | Zoom in |
| Ctrl/Cmd + `-` | Zoom out |
| Ctrl/Cmd + `0` | Reset to 100% |
| Arrow Left / PageUp | Previous page |
| Arrow Right / PageDown | Next page |
| Home / End | First / last page |
| Ctrl/Cmd + F | Open search |
| Ctrl/Cmd + G | Next search match (search bar open) |
| Shift + Ctrl/Cmd + G | Previous search match (search bar open) |
| Alt + A (Alt + L on macOS) | Toggle Highlight All |
| Alt + C | Toggle Match Case |
| Alt + I | Toggle Match Diacritics |
| Alt + W | Toggle Whole Words |

Plain wheel / one-finger drag still scroll. Shortcuts are ignored while typing in inputs, selects, textareas, or contenteditable fields. Search-bar option shortcuts still apply while the find field is focused.

## Capabilities and limits

**Supported**

- URL / File / Blob sources
- PDF.js workers, lazy page rendering, memory cleanup on close/replace
- Password prompt + retry
- Optional text layer + search
- Outline, thumbnails, attachments, internal destinations, external links
- XFA rendering when enabled (`features.xfa`)
- Native PDF.js annotation editors: highlight, free text, ink, stamp (themed Vue editor UI; native resize/undo)
- Modified PDF export via PDF.js `saveDocument` paths
- Tailwind CSS 4 theming with semantic color tokens (override `--vpdf-*` on `.vpdf-root`)
- Optional `smoothJump` for animated prev/next and page-number jumps (`prefers-reduced-motion` stays instant)
- Optional `pageGap` (px between pages; default `10`; `0` is flush)
- Optional `pageRadius` (page corner radius; default `10`; `0` is square, no border/shadow)
- Optional `destinationOffset` (px top inset when jumping via outline, in-document links, or search matches; default `20`; `0` is no inset)
- Toolbar zoom menu: Fit page / Fit width / Fit height plus 25%–800% presets
- Ctrl/Cmd + wheel and two-finger pinch zoom, plus common viewing shortcuts
- Document properties modal (overflow menu) from PDF.js metadata

**Not faked in core**

- Arbitrary annotation JSON import/export
- Comment/popup authoring beyond PDF.js-native editors
- Cryptographic digital signatures / certificate trust
- XFA editing
- PDF JavaScript scripting (off by default; explicit opt-in only)

## Theming

Scoped under `.vpdf-root` (no global Preflight). Core ships a single light palette. Tokens use semantic color names with a `--vpdf-*` prefix. Override on the viewer root, or add a class on `<VPdfViewer>` that sets the same variables:

```css
.vpdf-root {
  --vpdf-primary: #2563eb;
  --vpdf-text: #0f172a;
  --vpdf-text-muted: #64748b;
  --vpdf-bg: #f8fafc;
  --vpdf-bg-elevated: #ffffff;
  --vpdf-bg-muted: #f1f5f9;
  --vpdf-border: #e2e8f0;
  --vpdf-radius: 0.5rem;
}
```

**Semantic tokens**

| Token | Utility | Purpose |
|-------|---------|---------|
| `--vpdf-text` | `text-default` | Body text |
| `--vpdf-text-muted` | `text-muted` | Secondary text |
| `--vpdf-bg` | `bg-default` | Shell background |
| `--vpdf-bg-elevated` | `bg-elevated` | Toolbar, sidebar, dialogs |
| `--vpdf-bg-muted` | `bg-muted` | Viewer canvas, hovers |
| `--vpdf-border` | `border-default` | Borders |
| `--vpdf-primary` | `text-primary` / `bg-primary` | Accent |
| `--vpdf-error` | `text-error` | Errors |

Text selection and search matches use `--vpdf-text-selection-color`, `--vpdf-search-highlight-color`, and `--vpdf-search-highlight-selected-color`.

Apply a host or plugin class on the viewer (Vue class fallthrough or `options.class`) to swap palettes. Core does not cycle light/dark/auto.

## SSR

Initialize only on the client (`onMounted` / `<ClientOnly>`). The package dynamically imports PDF.js viewer modules in the browser.

## Security notes

- PDF scripting defaults to **off** (see PDF.js advisory class CVE-2026-16633).
- External links default to `target=_blank` with `rel="noopener noreferrer nofollow"`.
