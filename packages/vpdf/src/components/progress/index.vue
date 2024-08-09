<script setup lang="ts">
const props = defineProps({
  value: {
    type: Number,
    default: 0,
    validator: (e: number) => e >= 0 && e <= 100,
  },
});
</script>
<template>
  <div class="relative block overflow-hidden bg-gray-400/25 leading-none">
    <div
      class="absolute left-0 top-0 h-full bg-blue-700 leading-none text-white transition-transform"
      :style="{ width: `${value}%` }"
    ></div>
  </div>
</template>
