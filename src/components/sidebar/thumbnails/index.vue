<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from "vue";
import { PDFDocumentLoadingTask } from "pdfjs-dist/types/src/display/api";

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

const viewer = ref<typeof PDFViewer>();

watch(
  () => props.page,
  (val) => {
    if (val !== props.page) {
      viewer.value?.changePage(val);
    }
  }
);
</script>

<template>
  <PDFViewer
    v-if="!!pdf"
    ref="viewer"
    :pdf="pdf"
    :scale="0.18"
    :gap="15"
    :renderOffset="50"
  >
    <template #renderer="{ pageInfo, render }">
      <VPdfPageRenderer
        :pdf="pdf"
        :pageInfo="pageInfo"
        :render="render"
        :textLayer="false"
        :rotation="rotation"
        class="absolute cursor-pointer rounded-lg border border-dashed px-1 py-0.5 hover:border-blue-500"
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
            class="absolute -bottom-5 w-full text-center text-sm font-semibold"
          >
            {{ pageInfo.page }}
          </div>
        </template>
      </VPdfPageRenderer>
    </template>
  </PDFViewer>
</template>
