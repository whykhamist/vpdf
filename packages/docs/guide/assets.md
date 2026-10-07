# Assets and workers

PDF.js requires a worker and may also require character maps (CMaps), standard fonts, WASM files, and editor images depending on the document and features used. Configure these assets through `options.assets` ([`VPdfAssetUrls`](/guide/types#vpdfasseturls)).

```ts
import type { VPdfAssetUrls } from "@whykhamist/vpdf";

const assets: VPdfAssetUrls = {
  workerSrc: new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString(),
  cMapUrl: new URL("pdfjs-dist/cmaps/", import.meta.url).toString(),
  standardFontDataUrl: new URL(
    "pdfjs-dist/standard_fonts/",
    import.meta.url,
  ).toString(),
  wasmUrl: new URL("pdfjs-dist/wasm/", import.meta.url).toString(),
  imageResourcesPath: new URL(
    "pdfjs-dist/legacy/web/images/",
    import.meta.url,
  ).toString(),
};
```

```vue
<VPdfViewer
  :options="{
    assets: assets,
  }"
></VPdfViewer>
```

## Asset fields

### workerSrc

The PDF.js worker script (`pdf.worker.min.mjs`). Must match your installed `pdfjs-dist` version and be configured in every host application.

### cMapUrl

URL pointing to PDF.js character maps, required for rendering certain non-Unicode text encodings.

### standardFontDataUrl

URL pointing to standard fallback font data used when a PDF does not embed its required fonts.

### wasmUrl

URL pointing to PDF.js WebAssembly files. Optional unless you are using WASM-backed parsing features.

### imageResourcesPath

URL pointing to PDF.js annotation and form editor images. Required when features utilizing these assets are enabled.

## Asset URLs and bundlers

While the engine can infer fallback URLs from the installed pdfjs-dist package, explicit URLs are strongly recommended. Specifying them guarantees that your bundler correctly includes the required assets and that all files originate from the exact same pdfjs-dist version.

## Legacy vs modern worker

`@whykhamist/vpdf` internally imports from `pdfjs-dist/legacy/*`. Therefore, you should use the legacy worker unless every target browser in your deployment environment natively supports modern PDF.js worker APIs:

```ts
workerSrc: new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url,
).toString(),
```

If your target environments fully support modern features, the modern worker is located at:

```ts
"pdfjs-dist/build/pdf.worker.min.mjs";
```

## Using assets with Vite

When `pdfjs-dist` is installed as a dependency, Vite automatically resolves and emits package assets referenced via `new URL(..., import.meta.url)`:

```ts
const assets: VPdfAssetUrls = {
  workerSrc: new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString(),
  cMapUrl: new URL("pdfjs-dist/cmaps/", import.meta.url).toString(),
  standardFontDataUrl: new URL(
    "pdfjs-dist/standard_fonts/",
    import.meta.url,
  ).toString(),
};
```

### Alternative: Public Directory Approach

If your bundler does not automatically emit package assets, you can manually copy them to your app's public directory and use absolute paths:

```ts
assets: {
  workerSrc: "/pdfjs/pdf.worker.min.mjs",
  cMapUrl: "/pdfjs/cmaps/",
  standardFontDataUrl: "/pdfjs/standard_fonts/",
}
```

Ensure your public folder layout mirrors the expected paths:

```text
/public/pdfjs/
├── pdf.worker.min.mjs
├── cmaps/
├── standard_fonts/
└── wasm/
```

> [!IMPORTANT]
> Each URL must precisely match the path where the corresponding asset is served by your static file server. As noted in the [Quick Start](/guide/quick-start), ensure your worker, CMaps, and font versions stay strictly aligned with `pdfjs-dist@6.3.289`
