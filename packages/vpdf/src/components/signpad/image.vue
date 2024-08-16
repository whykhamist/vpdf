<script setup lang="ts">
import CanvasContainer from "./canvasContainer.vue";
import { PDFButton } from "../misc";
// const props = defineProps<{

// }>();

const browseImage = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/png";
  input.click();
  input.onchange = () => {
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
    }
  };
};
</script>

<template>
  <CanvasContainer>
    <div class="relative">
      <canvas class="relative z-10 h-48 w-96" />
    </div>
    <template #actions>
      <div class="flex flex-col">
        <div class="text-xs">
          <span class="font-bold">Note!: </span> It is recommended to use a png
          image with a transparent background.
        </div>
        <div class="flex items-center gap-2">
          <PDFButton />
        </div>
      </div>
    </template>
  </CanvasContainer>
</template>
