<script setup lang="ts">
import type { PDFDocumentLoadingTask } from "pdfjs-dist";
import { PropType, computed, defineAsyncComponent, ref, watch } from "vue";
import { usePdfViewer } from "../composables/usePdfViewer";

const VPdfPageRenderer = defineAsyncComponent(
  () => import("./vPdfPageRenderer.vue")
);

const props = defineProps({
  pdf: {
    type: Object as PropType<PDFDocumentLoadingTask>,
    required: true,
  },
  scale: {
    type: Number,
    default: 1.0,
  },
  gap: {
    type: Number,
    default: 10,
  },
  rotation: {
    type: Number,
    default: 0,
    validator: (val: number) => {
      const result = val % 90 == 0;
      if (!result) {
        throw new Error("Rotation must be a multiple of 90");
      }
      return result;
    },
  },
  view: {
    type: String as PropType<"vertical" | "horizontal">,
    default: "vertical",
  },
  page: {
    type: Number,
    default: 1,
  },
  textLayer: {
    type: Boolean,
    default: false,
  },
  smoothJump: {
    type: Boolean,
    default: false,
  },
  renderDelay: {
    type: Number,
    default: 50,
  },

  onProgress: {
    type: Function,
    default: () => {},
  },
});

const emit = defineEmits(["update:page", "update:scale", "progress"]);

const container = ref<HTMLElement>();

const slotBinds = computed(() => ({
  numPages: totalPage,
  progress: progress,
  pages: pageInfo,
  container: containerBounds,
  currentPage: currentPage,
  visiblePages: visiblePages,
  render: render,
  viewMode: viewMode,
  changePage,
  nextPage,
  prevPage,
  fitWidth,
  fitHeight,
  fitPage,
}));

const {
  totalPage,
  pageInfo,
  containerBounds,
  progress,
  render,
  currentPage,
  visiblePages,
  scale,
  viewMode,
  nextPage,
  prevPage,
  changePage,
  fitWidth,
  fitHeight,
  fitPage,
  // ------------ Unused properties / methods ------------
  // scrollState,
  // rotation,
  // readPDF,
  // getPageInfo,
  // getBounds,
  // getVBounds,
  // getHBounds,
  // getInnerBounds,
  // getGaps,
  // getVisiblePages,
  // boundsIntersecting,
  // onContainerScroll,
  // inRange,
  // getCurrentPage,
  // getFitRatio,
} = usePdfViewer(container, props);

watch(progress, (val) => {
  props.onProgress(val);
  emit("progress", val);
});

watch(currentPage, (val) => {
  emit("update:page", val);
});

watch(scale, (val) => {
  emit("update:scale", val);
});

defineExpose(slotBinds.value);
</script>

<template>
  <div
    ref="container"
    class="relative grid h-full min-h-0 w-full min-w-0 items-center overflow-scroll bg-gray-400/25"
    :class="{
      'grid items-center': viewMode != 'vertical',
    }"
  >
    <slot v-bind="slotBinds" name="prepend" />
    <div
      v-if="!!pdf"
      class="relative mx-auto"
      :style="{
        width: `${containerBounds.width}px`,
        height: `${containerBounds.height}px`,
      }"
    >
      <slot v-bind="slotBinds">
        <template v-for="vp in visiblePages" :key="vp.id">
          <slot name="renderer" :pdf="pdf" :pageInfo="vp" :render="render">
            <VPdfPageRenderer
              :pdf="pdf"
              :pageInfo="vp"
              class="absolute"
              :textLayer="textLayer"
              :render="render"
              :style="{
                top: `${vp.bounds.inner.top}px`,
                left: `${vp.bounds.inner.left}px`,
                width: `${vp.viewport.width}px`,
                height: `${vp.viewport.height}px`,
              }"
            />
          </slot>
        </template>
      </slot>
    </div>
    <slot v-bind="slotBinds" name="append" />
  </div>
</template>
