# SSR and Nuxt

Because PDF.js relies heavily on browser APIs like `window` and the `DOM`, attempting to mount the viewer during Server-Side Rendering (SSR) will fail. If you try to mount without a browser document, the engine throws:

```
[vpdf] PdfEngine requires a browser environment
```

To prevent this, ensure the viewer is always initialized exclusively on the client side.

## Vue SPAs

Standard Vue Single Page Applications (SPAs) render entirely on the client, meaning `VPdfViewer` handles its own module loading inside `onMounted` automatically. No extra wrapper components are required for a standard SPA setup.

## Nuxt Integration

For Server-Side Rendered frameworks like Nuxt, wrap the viewer inside Nuxt's built-in `<ClientOnly>` component and serve your PDF.js assets directly from the public directory:

```vue
<script setup lang="ts">
import { VPdfViewer } from "@whykhamist/vpdf";
import "@whykhamist/vpdf/style.css";
</script>

<template>
  <ClientOnly>
    <VPdfViewer
      src="/sample.pdf"
      :options="{
        assets: {
          workerSrc: '/pdfjs/pdf.worker.min.mjs',
          cMapUrl: '/pdfjs/cmaps/',
          standardFontDataUrl: '/pdfjs/standard_fonts/',
        },
      }"
    />
    <template #fallback>
      <p>Loading viewer…</p>
    </template>
  </ClientOnly>
</template>
```

> [!TIP]
> Place your worker, CMap, and font files under `public/pdfjs/` so Nuxt can serve them statically without trying to bundle Node-only paths. For more details, see the [Assets and workers](/guide/assets) guide.

## Headless composable (`useVPdfViewer`)

If you are building a custom UI using the headless composable instead of the default component, ensure that you also bind your mounting logic strictly to the client lifecycle.

Always call `mount(el)` inside `onMounted`, never during setup on the server:

```ts
import { onMounted, ref } from "vue";
import { useVPdfViewer } from "@whykhamist/vpdf";

const container = ref<HTMLElement | null>(null);
const options = ref<VPdfViewerOptions>({
  src: "/sample.pdf",
  toolbar: false,
});

const api = useVPdfViewer({
  options,
});

onMounted(() => {
  if (container.value) {
    api.mount(container.value);
  }
});

onBeforeUnmount(() => {
  api.destroy();
});
```

For full details on headless usage, see the [useVPdfViewer](/guide/use-vpdf-viewer) guide.
