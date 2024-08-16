<script setup lang="ts">
import { ref, onMounted, nextTick, markRaw, shallowRef } from "vue";
import { fabric } from "fabric";
import type { ISignData } from "../../types/signature";
import type { pdfPageInfo } from "../../types/pdf";

type IProps = {
  canvas: HTMLCanvasElement;
  signData: ISignData;
  pageInfo: pdfPageInfo;
};
const props = defineProps<IProps>();

const fabCan = ref();
const signImage = shallowRef<fabric.Image>();
const setSignPos = ref(true);
const imagePos = ref({
  x: -1,
  y: -1,
  w: 0,
  h: 0,
});

const init = () => {
  const bg = props.canvas.toDataURL();
  fabCan.value = markRaw(new fabric.Canvas(props.canvas));
  fabCan.value.setBackgroundImage(
    bg,
    fabCan.value.renderAll.bind(fabCan.value)
  );

  fabCan.value.on("mouse:down", (e: any) => {
    if (setSignPos.value) {
      imagePos.value.x = e.pointer.x;
      imagePos.value.y = e.pointer.y;
    }
  });
  fabCan.value.on("mouse:up", (e: any) => {
    if (setSignPos.value) {
      imagePos.value.w = e.pointer.x - imagePos.value.x;
      imagePos.value.h = e.pointer.y - imagePos.value.y;

      signImage.value = addSignature(props.signData.dataUrl, imagePos.value);
    }
  });
};

const addSignature = (imageData: string, bounds: any): fabric.Image => {
  const img = new Image();
  img.src = imageData;

  const signature = new fabric.Image(img);

  signature.set({
    angle: 0,
    width: bounds.w,
    height: bounds.h,
    left: bounds.x,
    top: bounds.y,
  });

  fabCan.value.add(signature);
  setSignPos.value = false;
  return signature;
};

const drawBoundingRect = () => {
  fabCan.value.on("after:render", () => {
    fabCan.value.contextContainer.strokeStyle = "#555";
    fabCan.value.forEachObject((obj: any) => {
      var bound = obj.getBoundingRect();

      fabCan.value.contextContainer.strokeRect(
        bound.left + 0.5,
        bound.top + 0.5,
        bound.width,
        bound.height
      );
    });
  });
};

const insideCanvas = (x: number, y: number): boolean => {
  const bound = {
    x1: 0,
    y1: 0,
    x2: fabCan.value.canvas.width,
    y2: fabCan.value.canvas.height,
  };

  return x > bound.x1 && x < bound.x2 && y > bound.y1 && y < bound.y2;
};

onMounted(() => {
  nextTick(init);
});
</script>

<template>
  <slot></slot>
</template>
