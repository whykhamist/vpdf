<script setup lang="ts">
import type { PDFDocumentLoadingTask } from "pdfjs-dist";
import { type PropType, computed, ref, watch } from "vue";
import { usePdfViewer } from "../composables/usePdfViewer";
import VPdfPageRenderer from "./vPdfPageRenderer.vue";

const props = defineProps({
  pdf: {
    type: Object as PropType<PDFDocumentLoadingTask>,
    required: true,
  },
  scale: {
    type: Number,
    default: 1.0,
  },
  scaling: {
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
        throw new Error(`Rotation must be a multiple of 90, ${val} given.`);
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

  renderOffset: {
    type: Number,
    default: 256,
  },

  onProgress: {
    type: Function,
    default: () => {},
  },
});

const emit = defineEmits(["update:page", "update:scale", "progress"]);

const container = ref<HTMLElement>();
const multiplier = ref(1);

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

watch([() => scale.value, () => props.scaling], (val) => {
  // multiplier.value = Math.abs(props.scaling / scale.value);
  // console.log(multiplier.value);
});

defineExpose(slotBinds.value);
</script>

<template>
  <div
    ref="container"
    class="vpdf:relative vpdf:grid vpdf:h-full vpdf:min-h-0 vpdf:w-full vpdf:min-w-0 vpdf:items-center vpdf:overflow-scroll vpdf:bg-foreground/15"
    :class="{
      'vpdf:grid vpdf:items-center': viewMode != 'vertical',
    }"
  >
    <slot v-bind="slotBinds" name="prepend" />
    <div
      v-if="!!pdf"
      class="vpdf:relative vpdf:mx-auto"
      :style="{
        width: `${containerBounds.width * multiplier}px`,
        height: `${containerBounds.height * multiplier}px`,
      }"
    >
      <slot v-bind="slotBinds">
        <template v-for="vp in visiblePages" :key="vp.id">
          <slot name="renderer" :pdf="pdf" :pageInfo="vp" :render="render">
            <VPdfPageRenderer
              :pdf="pdf"
              :pageInfo="vp"
              :scale="0.5"
              :textLayer="textLayer"
              :render="render"
              :visible="visiblePages.findIndex((p) => p.page == vp.page) > -1"
              class="vpdf:absolute"
              :style="{
                top: `${vp.bounds.inner.top * multiplier}px`,
                left: `${vp.bounds.inner.left * multiplier}px`,
                width: `${vp.viewport.width * multiplier}px`,
                height: `${vp.viewport.height * multiplier}px`,
              }"
            />
          </slot>
        </template>
      </slot>
    </div>
    <slot v-bind="slotBinds" name="append" />
  </div>
</template>
