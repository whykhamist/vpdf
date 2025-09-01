<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from "vue";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFPageProxy,
  PageViewport,
} from "pdfjs-dist";
import type { pdfPageInfo } from "../types/pdf";
import { log } from "../composables";

import TextLayer from "./layers/textLayer.vue";
import CanvasLayer from "./layers/canvas.vue";

type RenderArgs = {
  page: PDFPageProxy;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  viewport: PageViewport;
  doc: PDFDocumentProxy;
};

const props = withDefaults(
  defineProps<{
    pdf: PDFDocumentLoadingTask;
    pageInfo?: pdfPageInfo;
    page?: number;
    scale?: number;
    rotation?: number;
    textLayer?: boolean;
    render?: boolean;
    onRender?: (opts: RenderArgs) => void;
    onError?: Function;
    visible?: boolean;
  }>(),
  {
    textLayer: false,
    render: true,
    scale: 1,
    rotation: 0,
    visible: true,
    onRender: () => {},
  },
);

const rendering = ref(true);
// const canva = ref<HTMLCanvasElement>();
// const renderer = shallowRef();
const renderedPage = shallowRef<PDFPageProxy>();

// const ctx = computed(() =>
//   canva.value?.getContext("2d", {
//     alpha: false,
//     willReadFrequently: true,
//   }),
// );

const _pageInfo = ref(
  Object.assign({}, props.pageInfo, {
    scale: props.scale,
    rotation: props.rotation,
  }),
);

const createPageInfo = async (page: number): Promise<pdfPageInfo> => {
  const { docId, promise } = props.pdf;
  const doc = await promise;
  const p = await doc.getPage(page);
  const viewport = p.getViewport({
    scale: props.scale,
    rotation: props.rotation,
  });
  const bounds = {
    top: 0,
    bottom: viewport.height,
    left: 0,
    right: viewport.width,
  };

  return {
    id: `${docId}_pdf_page_${page}_${props.scale}_${props.rotation}`,
    page,
    scale: props.scale,
    rotation: props.rotation,
    viewport: viewport,
    pos: { x: 0, y: 0 },
    bounds: {
      inner: bounds,
      outer: bounds,
    },
  };
};

const onRender = (opts: RenderArgs) => {
  props.onRender?.(opts);
  renderedPage.value = opts.page;
  rendering.value = false;
};

// watch(
//   [() => props.render, () => props.visible, () => props.page, canva],
//   async (val, old) => {
//     if (!props.pageInfo && props.page) {
//       _pageInfo.value = await createPageInfo(props.page);
//     }
//     if ((val[0] && val[1] && !renderedPage.value) || val[2] != old[2]) {
//       console.log("RENDERING SOMEWHERE");
//       await renderPage();
//     }
//   },
//   { deep: true },
// );

// watch(
//   () => props.visible,
//   async (val) => {
//     if (val && _pageInfo.value && ctx.value) {
//       const { viewport } = _pageInfo.value;
//       ctx.value.fillStyle = "white";
//       ctx.value.fillRect(0, 0, viewport.width, viewport.height);
//       console.log("RENDERING VISIBLE");
//       await renderPage();
//     }
//   },
// );

onMounted(async () => {
  if (!props.pageInfo && !props.page) {
    log("Page not found!");
  } else if (!props.pageInfo && props.page) {
    _pageInfo.value = await createPageInfo(props.page);
  }
  // else if (props.render) {
  //   await renderPage();
  // }
});

// onBeforeUnmount(async () => {
//   if (rendering.value) {
//     renderer.value?.cancel();
//   }
//   renderedPage.value?.cleanup();
// });

// defineExpose({
//   context: ctx,
//   canvas: canva,
// });
</script>

<template>
  <div class="vpdf:leading-none">
    <div
      class="vpdf:relative vpdf:h-full vpdf:w-full vpdf:bg-white vpdf:leading-none"
      :width="_pageInfo?.viewport.width"
      :height="_pageInfo?.viewport.height"
    >
      <slot name="prepend" />
      <CanvasLayer
        v-if="_pageInfo && visible"
        :pdf
        :pageInfo="_pageInfo"
        @error="props.onError?.($event)"
        @render="onRender"
      />
      <TextLayer
        v-if="_pageInfo && textLayer && renderedPage"
        :page="renderedPage"
        :pageInfo="_pageInfo"
      />
      <div
        v-if="rendering"
        class="vpdf:pointer-events-none vpdf:absolute vpdf:inset-0 vpdf:flex vpdf:items-center vpdf:bg-foreground/5"
      >
        <div class="vpdf:mx-auto">
          <span
            class="vpdf:realtive vpdf:block vpdf:h-[1em] vpdf:w-[1em] vpdf:animate-mltShdSpin vpdf:overflow-hidden vpdf:rounded-full vpdf:-indent-[9999em] vpdf:text-sm vpdf:leading-none vpdf:text-foreground"
            style="transform: translateZ(0)"
          ></span>
        </div>
      </div>
      <slot name="append" />
    </div>
  </div>
</template>
