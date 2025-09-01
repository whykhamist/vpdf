<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import type { pdfPageInfo } from "../../types/pdf";
import type { PDFDocumentLoadingTask, PDFPageProxy } from "pdfjs-dist";
import type { RenderParameters } from "pdfjs-dist/types/src/display/api";

const props = defineProps<{
  pdf: PDFDocumentLoadingTask;
  pageInfo: pdfPageInfo;
}>();

const emit = defineEmits(["render", "error"]);

const rendering = ref(false);
const canva = ref<HTMLCanvasElement>();
const ctx = computed(() =>
  canva.value?.getContext("2d", {
    alpha: false,
    willReadFrequently: true,
  }),
);
const renderer = shallowRef();
const renderedPage = shallowRef<PDFPageProxy>();

const renderPage = async () => {
  if (canva.value && ctx.value) {
    rendering.value = true;
    const { viewport, page } = props.pageInfo;
    const { promise } = props.pdf;
    const doc = await promise;

    try {
      ctx.value.fillStyle = "white";
      ctx.value.fillRect(0, 0, viewport.width, viewport.height);

      renderedPage.value = await doc.getPage(page);
      const renderContext: RenderParameters = {
        canvasContext: ctx.value,
        canvas: canva.value,
        viewport,
      };

      renderer.value = renderedPage.value.render(renderContext);
      await renderer.value.promise;
      if (!!canva.value && !!ctx.value) {
        emit("render", {
          page: renderedPage.value,
          canvas: canva.value,
          context: ctx.value,
          viewport,
          doc,
        });
      }
    } catch (e: any) {
      emit("error", e);
      if (e.name != "RenderingCancelledException") {
      }
    } finally {
      rendering.value = false;
      renderedPage.value?.cleanup(true);
    }
  }
};

onMounted(async () => {
  await renderPage();
});

onBeforeUnmount(async () => {
  if (rendering.value) {
    renderer.value?.cancel();
  }
  renderedPage.value?.cleanup();
});
</script>

<template>
  <canvas
    ref="canva"
    class="vpdf:box-border vpdf:h-full vpdf:w-full vpdf:border vpdf:border-background-300 vpdf:bg-white vpdf:outline-none"
    :width="pageInfo.viewport.width"
    :height="pageInfo.viewport.height"
  />
</template>
