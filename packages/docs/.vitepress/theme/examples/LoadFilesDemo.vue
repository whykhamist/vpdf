<script setup lang="ts">
import { ref } from "vue";
import type { VPdfViewerController } from "@whykhamist/vpdf";
import DocsViewer from "../components/DocsViewer.vue";
import { DEMO_PDF_URL } from "../docsPdf";

const viewer = ref<{ controller?: VPdfViewerController }>();
const fileInput = ref<HTMLInputElement>();

async function onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) await viewer.value?.controller?.load(file);
}

async function onRemoteBlob() {
  const blob = await fetch(DEMO_PDF_URL).then((r) => r.blob());
  await viewer.value?.controller?.load(blob);
}
</script>

<template>
  <div>
    <div class="docs-vpdf-controls">
      <button
        type="button"
        class="docs-vpdf-btn"
        @click="fileInput?.click()"
      >
        Open file
      </button>
      <button type="button" class="docs-vpdf-btn" @click="onRemoteBlob">
        Load blob
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="application/pdf,.pdf"
        hidden
        @change="onFile"
      />
    </div>
    <DocsViewer ref="viewer" />
  </div>
</template>
