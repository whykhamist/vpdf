# Load files and blobs

Use the controller from a template ref, or the [open plugin](/plugins/open).

<LoadFilesDemo />

```vue
<script setup lang="ts">
import { ref } from "vue";
import { VPdfViewer, type VPdfViewerController } from "@whykhamist/vpdf";
import "@whykhamist/vpdf/style.css";

const viewer = ref<{ controller: VPdfViewerController }>();
const src = ref<string>();

async function onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) await viewer.value?.controller.load(file);
}

async function onRemoteBlob(url: string) {
  const blob = await fetch(url).then((r) => r.blob());
  await viewer.value?.controller.load(blob);
}
</script>

<template>
  <div>
    <input type="file" accept="application/pdf,.pdf" @change="onFile" />
    <VPdfViewer ref="viewer" :src="src" />
  </div>
</template>
```

Set `options.assets` as in [Quick start](/guide/quick-start) so the worker and CMaps resolve.

`ArrayBuffer` and `Uint8Array` work the same as `Blob`. URL strings are fetched by PDF.js (range loading when the server supports it). File/Blob become object URLs that are revoked on `close()`. For large remote files, prefer a URL over fetching into a blob first — see [Host PDFs](/examples/host-pdfs).
