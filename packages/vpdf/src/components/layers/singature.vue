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
const emit = defineEmits(["signed"]);

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

  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.cornerColor = "skyblue";
  fabric.Object.prototype.cornerStyle = "circle";
  fabric.Object.prototype.cornerStrokeColor = "blue";
  fabric.Object.prototype.borderColor = "blue";

  fabCan.value = markRaw(new fabric.Canvas(props.canvas));
  fabCan.value.setBackgroundImage(
    bg,
    fabCan.value.renderAll.bind(fabCan.value)
  );
  drawBoundingRect();
  fabCan.value.on("mouse:down", (e: any) => {
    if (setSignPos.value) {
      imagePos.value.x = e.pointer.x;
      imagePos.value.y = e.pointer.y;
    }
  });
  fabCan.value.on("mouse:up", async (e: any) => {
    if (setSignPos.value) {
      imagePos.value.w = e.pointer.x - imagePos.value.x;
      imagePos.value.h = e.pointer.y - imagePos.value.y;

      signImage.value = await addSignature(
        props.signData.dataUrl,
        imagePos.value
      );
    }
  });
};

const signed = () => {
  emit("signed", {});
};

const addSignature = (
  imageData: string,
  bounds: any
): Promise<fabric.Image> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageData;
    img.onload = () => {
      try {
        const signature = new fabric.Image(img);

        let scaleX = bounds.w / img.naturalWidth;
        let scaleY = bounds.h / img.naturalHeight;
        const minScale = 0.15 * props.pageInfo.scale;

        signature.set({
          angle: 0,
          width: img.naturalWidth,
          height: img.naturalHeight,
          left: bounds.x,
          top: bounds.y,
          scaleY: Math.max(scaleY, minScale),
          scaleX: Math.max(scaleX, minScale),
          minScaleLimit: minScale,
          lockScalingFlip: true,
          lockUniScaling: true,
        });

        signature.on("scaling", (e: any) => {
          console.log(e);
        });

        fabCan.value.add(signature);
        setSignPos.value = false;
        resolve(signature);
      } catch (e) {
        reject(e);
      }
    };
  });
};

const drawBoundingRect = () => {
  fabCan.value.on("after:render", () => {
    fabCan.value.contextContainer.strokeStyle = "skyblue";

    fabCan.value.getActiveObjects().forEach((obj: any) => {
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

onMounted(() => {
  nextTick(init);
});
</script>

<template>
  <slot>
    <div
      v-if="!signImage"
      class="pointer-events-none absolute inset-0 bg-gray-400/10 bg-checkered-lg"
    />
  </slot>
</template>
