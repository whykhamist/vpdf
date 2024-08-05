<script setup lang="ts">
import { ref, shallowRef, onMounted, nextTick, onBeforeUnmount } from "vue";
import { TextLayer, type PDFPageProxy } from "pdfjs-dist";
import type { pdfPageInfo } from "../../types/pdf";

const props = defineProps<{
  page: PDFPageProxy;
  pageInfo: pdfPageInfo;
}>();

const _textLayer = ref<HTMLElement>();
const layer = shallowRef<TextLayer>();
const endContent = ref<HTMLElement>();

const renderTextContent = async () => {
  if (!!_textLayer.value) {
    if (layer.value) {
      layer.value.cancel();
    }
    const { viewport } = props.pageInfo;
    const { rotation, scale } = viewport;
    const textContent = await props.page.streamTextContent({
      includeMarkedContent: true,
      disableNormalization: true,
    });
    layer.value = new TextLayer({
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
    await layer.value.render();

    endContent.value = document.createElement("div");
    endContent.value.classList.add("endOfContent");
    _textLayer.value.appendChild(endContent.value);
  }
};

const onMouseDown = () => {
  endContent.value?.classList.add("active");
};

const onMouseUp = () => {
  endContent.value?.classList.remove("active");
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

<style lang="scss">
.textLayer {
  span,
  br {
    min-height: 100%;
    min-width: 100%;
  }
}
.textLayer ::-moz-selection {
  background: rgba(33 133 255 / 0.25);
  background: color-mix(in srgb, AccentColor, transparent 75%);
}

.textLayer ::selection {
  background: rgba(33 133 255 / 0.25);
  background: color-mix(in srgb, AccentColor, transparent 75%);
}

.endOfContent {
  content: " ";
}
</style>

<template>
  <div
    ref="_textLayer"
    class="textLayer"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  />
</template>
