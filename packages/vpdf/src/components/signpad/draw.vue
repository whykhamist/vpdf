<script setup lang="ts">
import SignaturePad from "signature_pad";
import type { PointGroup } from "signature_pad";
import CanvasContainer from "./canvasContainer.vue";
import { PDFButton } from "../misc";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
// const props = defineProps<{

// }>();

const canv = ref();
const loaded = ref(false);
const history = ref<Array<PointGroup>>([]);
const future = ref<Array<PointGroup>>([]);
const signPad = ref();

const onStrokeEnd = () => {
  future.value = [];
  history.value = signPad.value.toData();
};

const onUpdateStroke = () => {};

const onWindowResize = () => {
  if (!!canv.value) {
    let ratio = Math.max(window.devicePixelRatio || 1, 1);
    canv.value.width = canv.value.offsetWidth * ratio;
    canv.value.height = canv.value.offsetHeight * ratio;
    canv.value.getContext("2d").scale(ratio, ratio);
    signPad.value.clear();
    signPad.value.fromData(history.value);
  }
};

const clear = () => {
  signPad.value.clear();
  history.value = [];
  future.value = [];
};

const undo = () => {
  const dat = history.value.pop() as PointGroup;
  future.value.push(dat);
  signPad.value.clear();
  signPad.value.fromData(history.value, { clear: false });
};

const redo = () => {
  const dat = future.value.pop() as PointGroup;
  history.value.push(dat);
  signPad.value.clear();
  signPad.value.fromData(history.value, { clear: false });
};

onMounted(() => {
  nextTick(() => {
    signPad.value = new SignaturePad(canv.value, {
      minWidth: 0.25,
      maxWidth: 5,
      canvasContextOptions: {
        willReadFrequently: true,
      },
    });
    signPad.value.clear();
    signPad.value.addEventListener("endStroke", onStrokeEnd);
    signPad.value.addEventListener("beforeUpdateStroke", onUpdateStroke);
    loaded.value = true;
  });
  window.addEventListener("resize", onWindowResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
});

defineExpose({
  getData: () => ({
    strokes: history.value,
    dataUrl: signPad.value.isEmpty()
      ? null
      : signPad.value.toDataURL("image/webp", 1),
  }),
  getCanvas: () => canv.value,
});
</script>

<template>
  <CanvasContainer>
    <canvas
      ref="canv"
      class="relative z-10 h-48 w-96 cursor-crosshair"
      width="384px"
      height="192px"
    />
    <template #actions>
      <div class="flex items-center gap-2">
        <PDFButton
          label="Delete"
          class="rounded-lg px-3 py-1"
          :disabled="signPad?.isEmpty()"
          @click="clear"
        />
        <PDFButton
          label="Undo"
          class="rounded-lg px-3 py-1"
          :disabled="history.length <= 0"
          @click="undo"
        />
        <PDFButton
          label="Redo"
          class="rounded-lg px-3 py-1"
          :disabled="future.length <= 0"
          @click="redo"
        />
      </div>
    </template>
  </CanvasContainer>
</template>
