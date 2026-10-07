# Quick start

Get up and running with `@whykhamist/vpdf` by mounting the viewer component inside your Vue 3 application.

PDF.js requires explicit worker, character map (cMap), and standard font URLs to correctly render fonts, text selections, and background parsing.

<DocsViewer />

```vue
<script setup lang="ts">
import { VPdfViewer } from "@whykhamist/vpdf";
import "@whykhamist/vpdf/style.css";
</script>

<template>
  <VPdfViewer
    src="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
    :options="{
      smoothJump: false,
      features: { scripting: false },
      assets: {
        workerSrc: new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString(),
        cMapUrl: new URL("pdfjs-dist/cmaps/", import.meta.url).toString(),
        standardFontDataUrl: new URL(
          "pdfjs-dist/standard_fonts/",
          import.meta.url,
        ).toString(),
      },
    }"
  />
</template>
```

## Important Configuration Notes

> [!NOTE] Height Requirement
> Give the viewer shell a bounded height. Because the root container uses a flex layout, it will not automatically expand to fill the viewport on its own unless explicitly sized:
>
> ```css
> .vpdf-root {
>   height: 100vh;
> }
> ```

> [!IMPORTANT] Worker Version Synchronization
> Always keep your worker version aligned with `pdfjs-dist@6.3.289`, which is the version required by `@whykhamist/vpdf`. The legacy worker shown above matches the library's internal imports and ensures compatibility across older versions of Chromium and Firefox ESR. Check the Assets and Workers guide before switching to the modern worker.
