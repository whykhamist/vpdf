<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { uniqid } from "../../composables";

const Button = defineAsyncComponent(() => import("../button/index.vue"));

const props = withDefaults(
  defineProps<{
    modelValue: number;
    pages: number;
    disabled?: boolean;
    mode: "vertical" | "horizontal";
    label?: string;
    hidePage?: boolean;
    hideNavigation?: boolean;
  }>(),
  {
    modelValue: 1,
    pages: 0,
    disabled: false,
  },
);

const emit = defineEmits(["update:modelValue"]);

const p = ref(props.modelValue);

const inputSize = computed<number>(() => Math.max(`${props.pages}`.length, 3));

const pagerId = uniqid();

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
  },
);
</script>
<template>
  <div
    v-if="!hidePage || !hideNavigation"
    class="vpdf:flex vpdf:items-center vpdf:justify-center vpdf:gap-2 vpdf:px-2"
  >
    <div
      v-if="!hideNavigation"
      class="vpdf:hidden vpdf:items-center vpdf:gap-0.5 vpdf:md:!flex"
    >
      <Button
        @click="changePage(-1)"
        icon="arrow_circle_up"
        class="vpdf:transition-transform"
        :iconClass="{ 'vpdf:-rotate-90': mode != 'vertical' }"
        :disabled="disabled"
      />
      <Button
        @click="changePage(1)"
        icon="arrow_circle_down"
        class="vpdf:transition-transform"
        :iconClass="{ 'vpdf:-rotate-90': mode != 'vertical' }"
        :disabled="disabled"
      />
    </div>
    <div
      v-if="!hidePage"
      class="vpdf:flex vpdf:items-center vpdf:justify-stretch vpdf:gap-1 vpdf:select-none"
      :class="{
        'vpdf:text-background-400': disabled,
      }"
    >
      <label
        :for="pagerId"
        class="vpdf:group vpdf:relative vpdf:max-w-10 vpdf:min-w-10 vpdf:bg-foreground/10 vpdf:leading-none vpdf:before:absolute vpdf:before:inset-x-0 vpdf:before:top-full vpdf:before:h-0.5 vpdf:before:bg-background-400/25"
        :class="{ 'vpdf:cursor-not-allowed vpdf:opacity-50': disabled }"
      >
        <input
          :id="pagerId"
          :value="p"
          :size="inputSize"
          class="vpdf:w-full vpdf:bg-transparent vpdf:px-1 vpdf:text-center vpdf:leading-none vpdf:outline-none vpdf:select-none"
          :class="{ 'vpdf:aria-disabled vpdf:pointer-events-none': disabled }"
          :disabled="disabled"
          @change="onChange"
        />
        <div
          class="vpdf:absolute vpdf:top-full vpdf:left-1/2 vpdf:h-0.5 vpdf:w-0 vpdf:-translate-x-1/2 vpdf:bg-primary-600 vpdf:opacity-0 vpdf:transition-all vpdf:group-focus-within:w-full vpdf:group-focus-within:opacity-100"
        />
      </label>
      <span class="vpdf:leading-none">/</span>
      <span class="vpdf:leading-none">{{ pages }}</span>
    </div>
  </div>
</template>
