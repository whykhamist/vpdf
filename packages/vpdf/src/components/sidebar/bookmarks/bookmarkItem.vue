<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import type { pdfOutlinePairs, Point } from "../../../types/pdf";

const Button = defineAsyncComponent(() => import("../../button/index.vue"));
const OutlineGroup = defineAsyncComponent(() => import("./index.vue"));

const props = defineProps<{
  outline: pdfOutlinePairs;
}>();

const emit = defineEmits(["changePage"]);

const open = ref(false);

const changePage = (page: number | null, offset: Point | null = null) => {
  if (page) {
    emit("changePage", { page, offset });
  }
};
</script>

<template>
  <div
    class="vpdf:relative vpdf:py-1 vpdf:pl-6 vpdf:leading-none vpdf:select-none"
  >
    <div
      v-if="outline.sub.length > 0"
      class="vpdf:absolute vpdf:top-0.5 vpdf:left-0 vpdf:flex vpdf:aspect-square vpdf:w-6 vpdf:items-center vpdf:justify-center vpdf:leading-none"
    >
      <Button
        icon="arrow_right"
        class="vpdf:rounded-md vpdf:px-2 vpdf:py-1 vpdf:font-bold"
        :iconClass="{
          'vpdf:w-4 vpdf:aspect-square vpdf:transition-transform': true,
          'vpdf:rotate-90': open,
        }"
        @click="open = !open"
      />
    </div>
    <Button
      focusDisabled
      class="vpdf:w-full vpdf:px-1 vpdf:hover:underline"
      @click="
        changePage(outline.page, { y: outline.offsetY, x: outline.offsetX })
      "
    >
      <div
        class="vpdf:pointer-events-none vpdf:flex vpdf:flex-auto vpdf:items-center vpdf:text-start vpdf:text-sm vpdf:leading-tight vpdf:break-all"
      >
        {{ outline.title }}
      </div>
    </Button>
    <div v-if="outline.sub.length > 0 && open" class="-ml-3 py-2">
      <div class="vpdf:border-l vpdf:border-foreground-400/50">
        <OutlineGroup
          :outline="outline.sub"
          @changePage="(e) => changePage(e.page, e.offset)"
        />
      </div>
    </div>
  </div>
</template>
