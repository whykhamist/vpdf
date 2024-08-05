<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from "vue";
import type { PDFDocumentLoadingTask } from "pdfjs-dist/types/src/display/api";

const VPdfPageRenderer = defineAsyncComponent(
  () => import("../../vPdfPageRenderer.vue")
);
const PDFViewer = defineAsyncComponent(() => import("../../vPdfViewer.vue"));

const props = defineProps<{
  pdf: PDFDocumentLoadingTask;
  page: number;
  rotation: number;
}>();

const emit = defineEmits(["changePage"]);

const thumbs = ref<typeof PDFViewer>();

watch(
  () => props.page,
  (val) => {
    thumbs.value?.changePage(val);
  }
);
</script>

<template>
  <PDFViewer
    v-if="!!pdf"
    ref="thumbs"
    :pdf="pdf"
    :scale="0.18"
    :gap="15"
    :renderOffset="50"
    :rotation="rotation"
    class="bg-transparent"
  >
    <template #renderer="{ pageInfo, render }">
      <VPdfPageRenderer
        :pdf="pdf"
        :pageInfo="pageInfo"
        :render="render"
        :textLayer="false"
        class="absolute cursor-pointer select-none rounded-lg border border-dashed px-1 py-0.5 transition-colors hover:border-blue-500 hover:bg-gray-400/25"
        :class="{
          'border-blue-500': pageInfo.page === page,
        }"
        :style="{
          top: `${pageInfo.bounds.inner.top}px`,
          left: `${pageInfo.bounds.inner.left}px`,
          width: `${pageInfo.viewport.width}px`,
          height: `${pageInfo.viewport.height}px`,
        }"
        @click="emit('changePage', { page: pageInfo.page, offset: null })"
      >
        <template #append>
          <div
            class="pointer-events-none absolute -bottom-5 w-full text-center text-sm font-semibold"
          >
            {{ pageInfo.page }}
          </div>
        </template>
      </VPdfPageRenderer>
    </template>
  </PDFViewer>
</template>
