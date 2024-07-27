<script setup lang="ts">
import { computed } from "vue";
import type { OnProgressParameters } from "pdfjs-dist/types/src/display/api";

const props = defineProps<OnProgressParameters>();

const progress = computed(() => (props.loaded / props.total) * 100);
</script>
<template>
  <div class="relative block overflow-hidden bg-gray-400/25 leading-none">
    <div
      class="absolute left-0 top-0 h-full bg-blue-700 leading-none text-white transition-transform"
      :style="{ width: `${progress}%` }"
    ></div>
  </div>
</template>
