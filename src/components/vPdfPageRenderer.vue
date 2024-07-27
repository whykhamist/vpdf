<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import {
  TextLayer,
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
  type PDFPageProxy,
  type PageViewport,
} from "pdfjs-dist";
import type { pdfPageInfo, RenderParameters } from "../types/pdf";

type RenderArgs = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  viewport: PageViewport;
  doc: PDFDocumentProxy;
};

interface IProps {
  pageInfo: pdfPageInfo;
  pdf: PDFDocumentLoadingTask;
  textLayer: boolean;
  render: boolean;
  onRender?: (opts: RenderArgs) => void;
  onError?: Function;
}
const props = withDefaults(defineProps<IProps>(), {
  textLayer: false,
  render: false,
  onRender: () => {},
});

const rendering = ref(false);
const canva = ref<HTMLCanvasElement>();
const renderer = shallowRef();
const renderedPage = shallowRef<PDFPageProxy>();

const _textLayer = ref<HTMLElement>();

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

      if (props.textLayer) {
        await renderTextContent();
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

const renderTextContent = async () => {
  if (!!_textLayer.value && !!renderedPage.value) {
    const { viewport } = props.pageInfo;
    const { rotation, scale } = viewport;
    const textContent = await renderedPage.value.getTextContent();
    const tlRenderer = new TextLayer({
      textContentSource: textContent,
      container: _textLayer.value,
      viewport,
    });
    let rat = viewport.width / viewport.height;
    let r = "";

    if (Math.abs(rotation) == 90) {
      r += `translateY(${100 / rat}%)`;
    }

    if (Math.abs(rotation) == 180) {
      r += `translate(100%, 100%)`;
    }

    if (Math.abs(rotation) == 270) {
      r += `translateX(${100 * rat}%)`;
    }

    r += `rotate(${rotation}deg)`;
    let s: CSSStyleDeclaration = _textLayer.value.style;
    s.setProperty("--scale-factor", `${scale}`);
    [
      "webkitTransform",
      "mozTransform",
      "msTransform",
      "oTransform",
      "transform",
    ].forEach((e) => {
      if (s.hasOwnProperty(e)) {
        Object.assign(s, { [e]: r });
      }
    });
    await tlRenderer.render();
  }
};

watch(
  () => props.textLayer,
  (val) => {
    nextTick(() => {
      if (val) {
        renderTextContent();
      }
    });
  }
);

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

<style lang="scss">
@use "pdfjs-dist/web/pdf_viewer.css";

.textlayer {
  span {
    line-height: 1;
  }
}
</style>

<template>
  <div class="leading-none">
    <div
      class="relative h-full w-full rounded-lg bg-white leading-none text-gray-800"
    >
      <canvas
        ref="canva"
        class="box-border h-full w-full rounded-lg border border-gray-400 bg-white text-gray-800 outline-none"
        :class="{
          hidden: rendering,
        }"
        :width="pageInfo.viewport.width"
        :height="pageInfo.viewport.height"
      />
      <div ref="_textLayer" v-if="textLayer" class="textLayer" />
      <Transition
        enter-from-class="opacity-0 blur-sm"
        leave-to-class="opacity-0 blur-sm"
        enter-active-class="transition"
        leave-active-class="transition"
      >
        <div
          v-if="rendering"
          class="absolute inset-0 flex items-center rounded-lg bg-black/5"
        >
          <div class="mx-auto">
            <span
              class="realtive block h-[1em] w-[1em] animate-mltShdSpin overflow-hidden rounded-full -indent-[9999em] text-sm leading-none text-black"
              style="transform: translateZ(0)"
            ></span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
