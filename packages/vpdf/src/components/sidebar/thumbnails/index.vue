<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from "vue";
import type { PDFDocumentLoadingTask } from "pdfjs-dist/types/src/display/api";

const VPdfPageRenderer = defineAsyncComponent(
  () => import("../../vPdfPageRenderer.vue"),
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
  },
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
    class="vpdf:bg-transparent"
  >
    <template #renderer="{ pageInfo, render }">
      <VPdfPageRenderer
        :pdf="pdf"
        :pageInfo="pageInfo"
        :render="render"
        :textLayer="false"
        class="vpdf:absolute vpdf:cursor-pointer vpdf:rounded-lg vpdf:border vpdf:border-dashed vpdf:px-1 vpdf:py-0.5 vpdf:transition-colors vpdf:select-none vpdf:hover:border-accent-500 vpdf:hover:bg-background-400/25"
        :class="{
          'vpdf:border-accent-500': pageInfo.page === page,
          'vpdf:border-transparent': pageInfo.page !== page,
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
            class="vpdf:pointer-events-none vpdf:absolute vpdf:-bottom-5 vpdf:w-full vpdf:text-center vpdf:text-sm vpdf:font-semibold"
          >
            {{ pageInfo.page }}
          </div>
        </template>
      </VPdfPageRenderer>
    </template>
  </PDFViewer>
</template>
