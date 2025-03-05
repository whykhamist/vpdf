<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import {
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
  type PDFPageProxy,
  type PageViewport,
} from "pdfjs-dist";
import type { pdfPageInfo, RenderParameters } from "../types/pdf";

const TextLayer = defineAsyncComponent(() => import("./layers/textLayer.vue"));

type RenderArgs = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  viewport: PageViewport;
  doc: PDFDocumentProxy;
};

const props = withDefaults(
  defineProps<{
    pageInfo: pdfPageInfo;
    pdf: PDFDocumentLoadingTask;
    textLayer: boolean;
    render: boolean;
    onRender?: (opts: RenderArgs) => void;
    onError?: Function;
  }>(),
  {
    textLayer: false,
    render: false,
    onRender: () => {},
  }
);

const rendering = ref(false);
const canva = ref<HTMLCanvasElement>();
const renderer = shallowRef();
const renderedPage = shallowRef<PDFPageProxy>();

const ctx = computed(() =>
  canva.value?.getContext("2d", {
    alpha: false,
    willReadFrequently: true,
  })
);

const renderPage = async () => {
  if (!rendering.value && !!canva.value && !!ctx.value) {
    rendering.value = true;
    const { viewport, page } = props.pageInfo;
    const { promise } = props.pdf;
    const doc = await promise;

    try {
      renderedPage.value = await doc.getPage(page);
      const renderContext: RenderParameters = {
        canvasContext: ctx.value,
        viewport,
      };

      renderer.value = renderedPage.value.render(renderContext);
      await renderer.value.promise;
      if (!!canva.value && !!ctx.value) {
        props.onRender({
          canvas: canva.value,
          context: ctx.value,
          viewport,
          doc,
        });
      }
    } catch (e: any) {
      props.onError?.(e);
      if (e.name != "RenderingCancelledException") {
      }
    } finally {
      rendering.value = false;
      renderedPage.value?.cleanup(true);
    }
  }
};

watch(
  () => props.render,
  async (val) => {
    if (val && !renderedPage.value) {
      await renderPage();
    }
  }
);

onMounted(async () => {
  if (props.render) {
    await renderPage();
  }
});

onBeforeUnmount(async () => {
  if (rendering.value) {
    renderer.value.cancel();
  }
  renderedPage.value?.cleanup();
});

defineExpose({
  context: ctx,
  canvas: canva,
});
</script>

<template>
  <div class="leading-none">
    <div class="relative h-full w-full bg-white leading-none">
      <slot name="prepend" />
      <canvas
        ref="canva"
        class="box-border h-full w-full border border-gray-400 bg-white outline-none"
        :class="{
          hidden: rendering,
        }"
        :width="pageInfo.viewport.width"
        :height="pageInfo.viewport.height"
      />
      <TextLayer
        v-if="textLayer && renderedPage"
        :page="renderedPage!"
        :pageInfo="pageInfo"
      />
      <Transition
        enter-from-class="opacity-0 blur-sm"
        leave-to-class="opacity-0 blur-sm"
        enter-active-class="transition"
        leave-active-class="transition"
      >
        <div
          v-if="rendering"
          class="absolute inset-0 flex items-center bg-black/5"
        >
          <div class="mx-auto">
            <span
              class="realtive block h-[1em] w-[1em] animate-mltShdSpin overflow-hidden rounded-full -indent-[9999em] text-sm leading-none text-black"
              style="transform: translateZ(0)"
            ></span>
          </div>
        </div>
      </Transition>
      <slot name="append" />
    </div>
  </div>
</template>
