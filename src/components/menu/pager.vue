<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from "vue";

const Button = defineAsyncComponent(() => import("../button/index.vue"));

const props = withDefaults(
  defineProps<{
    modelValue: number;
    pages: number;
    disabled?: boolean;
    mode: "vertical" | "horizontal";
  }>(),
  {
    modelValue: 1,
    pages: 0,
    disabled: false,
  }
);

const emit = defineEmits(["update:modelValue"]);

const p = ref(props.modelValue);

const inputSize = computed<number>(() => Math.max(`${props.pages}`.length, 3));

const isInt = (n: number) => n % 1 === 0;
const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (isInt(+target.value) && +target.value <= props.pages) {
    p.value = +target.value;
    emit("update:modelValue", p.value);
  } else {
    target.value = p.value.toString();
  }
};

const changePage = (offset: number) => {
  let p = Math.max(Math.min(props.modelValue + offset, props.pages), 1);
  emit("update:modelValue", p);
};

watch(
  () => props.modelValue,
  (val) => {
    p.value = val;
  }
);
</script>
<template>
  <div class="flex items-center justify-center gap-2 px-2">
    <div class="flex items-center gap-0.5">
      <Button
        @click="changePage(-1)"
        icon="arrow_circle_up"
        class="group rounded-lg px-1 py-0.5"
        :iconClass="{
          'aspect-square w-6 fill-gray-600 transition-colors group-hover:fill-blue-500 transition-transform': true,
          '-rotate-90': mode != 'vertical',
        }"
      />
      <Button
        @click="changePage(1)"
        icon="arrow_circle_down"
        class="group rounded-lg px-1 py-0.5"
        :iconClass="{
          'aspect-square w-6 fill-gray-600 transition-colors group-hover:fill-blue-500 transition-transform': true,
          '-rotate-90': mode != 'vertical',
        }"
      />
    </div>
    <div class="flex select-none items-center justify-stretch gap-1">
      <label
        for="__PDF__PAGER_INPUT__"
        class="group relative max-w-10 leading-none before:absolute before:inset-x-0 before:top-full before:h-0.5 before:bg-gray-400/25"
        :class="{ 'cursor-not-allowed opacity-50': disabled }"
      >
        <input
          id="__PDF__PAGER_INPUT__"
          :value="p"
          :size="inputSize"
          class="w-full select-none bg-gray-300/25 px-1 text-center leading-none outline-none"
          :class="{ 'aria-disabled pointer-events-none': disabled }"
          :disabled="disabled"
          @change="onChange"
        />
        <div
          class="absolute left-1/2 top-full h-0.5 w-0 -translate-x-1/2 bg-blue-600 opacity-0 transition-all group-focus-within:w-full group-focus-within:opacity-100"
        />
      </label>
      <span class="leading-none">/</span>
      <span class="leading-none">{{ pages }}</span>
    </div>
  </div>
</template>
