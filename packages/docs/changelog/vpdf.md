# @whykhamist/vpdf

Core viewer changelog. Plugin packages have their own pages.

## 3.0.0

2026-10-07. First stable release. It replaces `2.0.1-alpha`. The viewer is a PDF.js 6 shell with a plugin API, and the 2.x component props do not carry over.

### Highlights

- Viewer core on **pdfjs-dist 6.3.289**, loaded through the **legacy** PDF.js build so older Chromium and Firefox ESR still work.
- Default chrome (navigation, zoom, rotate, search, annotations, download, thumbnails, outline, attachments, document properties) is a set of built-in plugins. Turn one off with `plugins.enabled`, or replace it by registering the same id.
- Native editors for highlight, free text, ink, and stamp, with a themed Vue toolbar. Modified files save through PDF.js `saveDocument`.
- Find bar with highlight-all, match case, whole words, and diacritics.
- Document properties modal from a safe metadata allowlist (title, author, dates, page size, and similar). It omits source URLs, fingerprints, and encryption details.
- XFA display when `features.xfa` is on. PDF JavaScript stays off unless `features.scripting` is set.
- Pinch zoom and Ctrl/Cmd+wheel zoom (25%–800%), plus paging and find shortcuts.
- Styles stay inside `.vpdf-root`. Override `--vpdf-*` tokens for a custom palette. Core ships one light palette.
- ESM package with TypeScript types. Import `@whykhamist/vpdf/style.css` once.

Open, print, page layout, Iconify, and XFA thumbnail raster shipped in the same line as separate installs. See the [changelog index](/changelog/).

### Upgrade from 2.x

```bash
npm install @whykhamist/vpdf pdfjs-dist@6.3.289
```

```vue
<script setup lang="ts">
import { VPdfViewer } from "@whykhamist/vpdf";
import "@whykhamist/vpdf/style.css";
</script>

<template>
  <VPdfViewer
    src="https://example.com/file.pdf"
    :options="{
      scale: 'page-width',
      smoothJump: false,
      features: { textLayer: true },
      assets: {
        workerSrc: new URL(
          'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString(),
      },
    }"
  />
</template>
```

| 2.x | 3.0.0 |
| --- | --- |
| `<VPdf>` | `<VPdfViewer>` |
| `usePdf` / `usePdfViewer` | `useVPdfViewer` |
| Top-level props (`scale`, `textLayer`, `workerSrc`, `password`, `smoothJump`) | `options` on the viewer |
| `scale={-1\|-2\|-3}` for fit page / width / height | `"page-fit"`, `"page-width"`, `"page-height"` |
| `textLayer` default `false` | `features.textLayer` default `true` |
| `view="horizontal"` on the viewer | [`@whykhamist/vpdf-plugin-page-layout`](/changelog/page-layout) |
| Shade tokens (`--vpdf-color-foreground-500`, `.vpdf-dark`) | Semantic tokens (`--vpdf-text`, `--vpdf-bg`, …) on `.vpdf-root` |
| Icon font CSS variables | [`@whykhamist/vpdf-plugin-iconify`](/changelog/iconify), or your own icon renderer |
| `pdfjs-dist` peer `^5.2.133` | Direct dependency pinned to `6.3.289` |
| UMD `require` and `./src/*` export | ESM only (`dist/vpdf.js`) |

`VPdfPage` and the old hand-rolled virtual scroller are gone. Page rendering is the PDF.js viewer. Headless use goes through `useVPdfViewer` and its controller.

Vue stays at `^3.5`. Initialize the viewer on the client (`onMounted` or `<ClientOnly>`).

### Security defaults

- `features.scripting` is false. `documentInit.enableScripting` and `isEvalSupported` are overwritten after merge; eval stays off.
- External links open in a new tab with `noopener noreferrer nofollow`.
- Attachment downloads can be intercepted with `allowAttachmentDownload: false`.

### Still out of core

Annotation JSON import/export, comment authoring beyond the PDF.js editors, digital signatures, and XFA editing.

## 2.0.1-alpha

2025-09-02. Updated the `style.css` export mapping in `package.json`.

## 2.0.0-alpha

2025-09-02.

- Tailwind 4 with a class prefix, shade tokens (50–950) for background, foreground, primary, secondary, accent, positive, and negative, CSS variables for colors and icons.
- Layout change that offsets some menu items to the bottom.
- `scale` on `VPdf` for initial load, including negative fit modes: `-1` fit page, `-2` fit width, `-3` fit height, plus additional hidden scale factors.

## 1.0.2-alpha

2025-03-11. Published with no release notes.

## 1.0.1-alpha

2025-03-11. Published with no release notes.
