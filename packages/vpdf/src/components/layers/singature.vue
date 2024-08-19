<script setup lang="ts">
import { ref, onMounted, nextTick, markRaw, shallowRef, watch } from "vue";
import { fabric } from "fabric";
import type { ISignData, ISignature } from "../../types/signature";
import type { pdfPageInfo } from "../../types/pdf";

type IProps = {
  canvas: HTMLCanvasElement;
  signData?: ISignData;
  pageInfo: pdfPageInfo;
  signs?: Array<ISignature>;
};
const props = defineProps<IProps>();
const emit = defineEmits(["signed", "update:signs"]);

const fabCan = ref();
const signImage = shallowRef<fabric.Image>();
const setSignPos = ref(!!props.signData);
const imagePos = ref({
  x: -1,
  y: -1,
  w: 0,
  h: 0,
});
const scalingData = ref({
  left: -1,
  top: -1,
  scalex: 0,
  scaley: 0,
  width: 0,
  height: 0,
});

const init = async () => {
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
  await drawSignatures();
  fabCan.value.renderAll();

  fabCan.value.on("object:moving", (e: any) => {
    var obj = e.target;
    // if object is too big ignore
    if (
      obj.currentHeight > obj.canvas.height ||
      obj.currentWidth > obj.canvas.width
    ) {
      return;
    }
    obj.setCoords();
    // top-left  corner
    if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
      obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
      obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
    }
    // bot-right corner
    if (
      obj.getBoundingRect().top + obj.getBoundingRect().height >
        obj.canvas.height ||
      obj.getBoundingRect().left + obj.getBoundingRect().width >
        obj.canvas.width
    ) {
      obj.top = Math.min(
        obj.top,
        obj.canvas.height -
          obj.getBoundingRect().height +
          obj.top -
          obj.getBoundingRect().top
      );
      obj.left = Math.min(
        obj.left,
        obj.canvas.width -
          obj.getBoundingRect().width +
          obj.left -
          obj.getBoundingRect().left
      );
    }
  });

  fabCan.value.on("object:scaling", function (e: any) {
    const obj = e.target;
    obj.setCoords();
    const brNew = obj.getBoundingRect();

    if (
      brNew.width + brNew.left >= obj.canvas.width ||
      brNew.height + brNew.top >= obj.canvas.height ||
      brNew.left < 0 ||
      brNew.top < 0
    ) {
      obj.left = scalingData.value.left;
      obj.top = scalingData.value.top;
      obj.scaleX = scalingData.value.scalex;
      obj.scaleY = scalingData.value.scaley;
      obj.width = scalingData.value.width;
      obj.height = scalingData.value.height;
    } else {
      scalingData.value.left = obj.left;
      scalingData.value.top = obj.top;
      scalingData.value.scalex = obj.scaleX;
      scalingData.value.scaley = obj.scaleY;
      scalingData.value.width = obj.width;
      scalingData.value.height = obj.height;
    }
  });

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
        props.signData!.dataUrl,
        imagePos.value
      );
      // signed(signImage.value);
    }
  });
};

const drawSignatures = async () => {
  return new Promise((res) => {
    res(
      props.signs?.forEach(async (sign) => {
        return new Promise((resolve) => {
          if (sign) {
            const {
              signData,
              angle,
              left,
              top,
              width,
              height,
              scaleX,
              scaleY,
            } = sign;
            const img = new Image();
            img.onload = () => {
              const _sign = new fabric.Image(img, {
                left: left,
                top: top,
                scaleX: scaleX * props.pageInfo.scale,
                scaleY: scaleY * props.pageInfo.scale,
                width: width,
                height: height,
                selectable: false,
                hoverCursor: "default",
              });
              _sign.rotate(angle);
              fabCan.value.add(_sign);
              resolve();
            };
            img.src = signData.dataUrl;
          }
        });
      })
    );
  });
};

const signed = (e: any) => {
  const { scaleX, scaleY, width, height, left, top, angle } = e;
  emit("signed", {
    signData: props.signData,
    scaleX: scaleX / props.pageInfo.scale,
    scaleY: scaleY / props.pageInfo.scale,
    width,
    height,
    left,
    top,
    angle,
  });
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

        fabCan.value.add(signature);
        fabCan.value.setActiveObject(signature);
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

watch(() => props.signs, drawSignatures, { deep: true });

onMounted(() => {
  nextTick(init);
});
</script>

<template>
  <slot>
    <div
      v-if="!signImage && !!signData"
      class="pointer-events-none absolute inset-0 bg-gray-400/10 bg-checkered-lg"
    />
  </slot>
</template>
