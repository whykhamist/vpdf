<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { pdfOutlinePairs, Point } from "../../../types/pdf";

const Button = defineAsyncComponent(() => import("../../button/index.vue"));
const OutlineGroup = defineAsyncComponent(() => import("./index.vue"));

const props = defineProps<{
  outline: pdfOutlinePairs;
}>();

const emit = defineEmits(["changePage"]);

const open = ref(false);

const changePage = (page: number | null, offset: Point | null = null) => {
  if (!!page) {
    emit("changePage", { page, offset });
  }
};
</script>

<template>
  <div class="relative select-none py-1 pl-6 leading-none">
    <div
      v-if="outline.sub.length > 0"
      class="absolute left-0 top-0.5 flex aspect-square w-6 items-center justify-center leading-none"
    >
      <Button
        icon="arrow_right"
        class="rounded-md px-2 py-1 font-bold"
        :iconClass="{
          'w-4 aspect-square transition-transform': true,
          'rotate-90': open,
        }"
        @click="open = !open"
      />
    </div>
    <Button
      focusDisabled
      class="w-full px-1 hover:underline"
      @click="
        changePage(outline.page, { y: outline.offsetY, x: outline.offsetX })
      "
    >
      <div
        class="pointer-events-none flex flex-auto items-center break-all text-start text-sm leading-tight"
      >
        {{ outline.title }}
      </div>
    </Button>
    <div v-if="outline.sub.length > 0 && open" class="-ml-3 py-2">
      <div class="border-y border-l border-gray-400/50">
        <OutlineGroup
          :outline="outline.sub"
          @changePage="(e) => changePage(e.page, e.offset)"
        />
      </div>
    </div>
  </div>
</template>
