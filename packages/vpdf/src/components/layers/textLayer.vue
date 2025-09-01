<script setup lang="ts">
import { ref, shallowRef, onMounted, nextTick, onBeforeUnmount } from "vue";
import {
  type PageViewport,
  TextLayer,
  Util,
  type PDFPageProxy,
} from "pdfjs-dist";
import type { pdfPageInfo } from "../../types/pdf";
import type { TextContent, TextItem } from "pdfjs-dist/types/src/display/api";

const props = defineProps<{
  page: PDFPageProxy;
  pageInfo: pdfPageInfo;
}>();

const _textLayer = ref<HTMLElement>();
const layer = shallowRef<TextLayer>();
const endContent = ref<HTMLElement>();

const renderTextContent = async () => {
  if (_textLayer.value) {
    if (layer.value) {
      layer.value.cancel();
    }
    const { viewport } = props.pageInfo;
    const textContent = await props.page.getTextContent({
      includeMarkedContent: true,
      disableNormalization: true,
    });
    // textContent.items = sortTextItems(textContent.items as TextItem[]);

    layer.value = new TextLayer({
      textContentSource: textContent,
      container: _textLayer.value,
      viewport: viewport.clone({ dontFlip: true }),
    });

    await layer.value.render();

    rotateTextLayer(viewport);

    endContent.value = document.createElement("div");
    endContent.value.classList.add("endOfContent");
    _textLayer.value.appendChild(endContent.value);
  }
};

const sortTextItems = (items: TextItem[], tolerance = 2): any[] => {
  return items.sort((a, b) => {
    const [aX, aY] = [a.transform[4], a.transform[5]];
    const [bX, bY] = [b.transform[4], b.transform[5]];

    if (Math.abs(aY - bY) > tolerance) {
      return bY - aY;
    }

    return aX - bX;
  });
};

const rotateTextLayer = (viewport: PageViewport) => {
  const { scale, rotation, width, height } = viewport;
  let rat = viewport.width / viewport.height;
  let r = "";

  let s: CSSStyleDeclaration = _textLayer.value!.style;
  s.setProperty("--scale-factor", `${scale}`);
  s.setProperty("--total-scale-factor", `${scale}`);

  if (Math.abs(rotation) == 90) {
    r += `translateY(${100 / rat}%)`;
  }

  if (Math.abs(rotation) == 180) {
    r += `translate(100%, 100%)`;
  }

  if (Math.abs(rotation) == 270) {
    r += `translateX(${100 * rat}%)`;
  }

  if (Math.abs(rotation) == 0 || Math.abs(rotation) == 180) {
    s.setProperty("width", `${width}px`);
    s.setProperty("height", `${height}px`);
  } else if (Math.abs(rotation) == 90 || Math.abs(rotation) == 270) {
    s.setProperty("width", `${height}px`);
    s.setProperty("height", `${width}px`);
  }

  r += `rotate(${rotation}deg)`;

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
};

const onMouseDown = () => {
  endContent.value!.style.width = _textLayer.value?.style.width!;
  endContent.value!.style.height = _textLayer.value?.style.height!;
  _textLayer.value?.classList.add("selecting");
};

const onMouseUp = () => {
  endContent.value!.style.width = "";
  endContent.value!.style.height = "";
  _textLayer.value?.classList.remove("selecting");
};

onMounted(() => {
  nextTick(() => {
    renderTextContent();
  });
});

onBeforeUnmount(() => {
  layer.value?.cancel();
});
</script>
<template>
  <div
    ref="_textLayer"
    class="vpdf:textLayer"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  />
</template>
