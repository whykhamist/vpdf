<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    mode?: "vertical" | "horizontal";
    label?: string;
  }>(),
  {
    mode: "horizontal",
  },
);
</script>

<template>
  <div
    class="vpdf:flex vpdf:items-center vpdf:justify-center vpdf:gap-1"
    :class="{
      'vpdf:flex-col': mode == 'vertical',
      '': mode == 'horizontal',
    }"
  >
    <div
      class="vpdf:flex-auto vpdf:bg-foreground-400"
      :class="{
        'vpdf:w-px': mode == 'vertical',
        'vpdf:h-px': mode == 'horizontal',
      }"
    ></div>
    <template v-if="label">
      <span
        class="vpdf:text-sm vpdf:leading-none vpdf:font-bold vpdf:uppercase"
      >
        {{ label }}
      </span>
      <div
        class="vpdf:flex-auto vpdf:bg-foreground-400"
        :class="{
          'vpdf:w-px': mode == 'vertical',
          'vpdf:h-px': mode == 'horizontal',
        }"
      ></div>
    </template>
  </div>
</template>
