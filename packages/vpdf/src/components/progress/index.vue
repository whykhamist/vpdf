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
  <div
    class="vpdf:relative vpdf:block vpdf:overflow-hidden vpdf:bg-background-400/25 vpdf:leading-none"
  >
    <div
      class="vpdf:absolute vpdf:top-0 vpdf:left-0 vpdf:h-full vpdf:bg-primary-700 vpdf:leading-none vpdf:text-foreground vpdf:transition-transform"
      :style="{ width: `${value}%` }"
    ></div>
  </div>
</template>
