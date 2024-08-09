<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted } from "vue";

const Button = defineAsyncComponent(() => import("../button/index.vue"));
const props = withDefaults(
  defineProps<{
    scale: number;
    scales?: Array<{
      value?: number | string;
      show: boolean;
      label?: string;
    }>;
    disabled?: boolean;
  }>(),
  {
    scale: 1,
    scales: () => [
      { value: 0.25, show: true },
      { value: 0.333, show: false },
      { value: 0.5, show: true },
      { value: 0.584, show: false },
      { value: 0.667, show: false },
      { value: 0.75, show: true },
      { value: 1, show: true },
      { value: 1.25, show: true },
      { value: 1.5, show: true },
      { value: 2, show: true },
      { value: 4, show: true },
      { value: 8, show: true },
      { show: true },
      { label: "Fit Page", value: "fit", show: true },
      { label: "Fit Width", value: "width", show: true },
      { label: "Fit Height", value: "height", show: true },
    ],
  }
);

const emit = defineEmits(["update:scale", "fitPage"]);

const _scales = computed(() =>
  props.scales.filter((s) => {
    if (typeof s.value == "number") {
      let ss = +s.value;
      return s !== null && !isNaN(ss) && ss > 0;
    }
    return false;
  })
);

const scaleIndex = computed(() =>
  _scales.value.findIndex((s) => s.value === props.scale)
);

const nextScale = () => {
  let i = Math.min(scaleIndex.value + 1, _scales.value.length);
  emit("update:scale", _scales.value[i].value);
};

const prevScale = () => {
  let i = Math.max(scaleIndex.value - 1, 0);
  emit("update:scale", _scales.value[i].value);
};

const onScaleSelect = (e: Event) => {
  let val = (e.target as HTMLInputElement).value;
  isNaN(+val) ? emit("fitPage", val) : emit("update:scale", +val);
};

defineExpose({
  scales: _scales,
});
</script>

<template>
  <div class="flex items-center justify-center gap-0.5 px-2">
    <Button
      icon="zoom_out"
      class="group rounded-lg px-1 py-0.5 text-2xl"
      :disabled="scaleIndex == 0 || disabled"
      @click="prevScale"
    />
    <Button
      icon="zoom_in"
      class="group rounded-lg px-1 py-0.5 text-2xl"
      :disabled="scaleIndex == _scales.length - 1 || disabled"
      @click="nextScale"
    />
    <label
      for="__PDF_SCALE_SELECT__"
      class="group relative hidden max-w-24 rounded-t-md bg-foreground/10 leading-none before:absolute before:inset-x-0 before:top-full before:h-0.5 before:bg-gray-400/25 md:block"
    >
      <select
        id="__PDF_SCALE_SELECT__"
        class="max-w-full bg-transparent text-center leading-none outline-none"
        :value="scale"
        :disabled="disabled"
        @change="onScaleSelect"
      >
        <template v-if="scaleIndex <= -1">
          <option :value="scale" hidden>
            {{ (scale * 100).toFixed(1).replace(/[.,]0$/, "") + "%" }}
          </option>
        </template>
        <template v-for="s in scales" :key="`${s}`">
          <option
            :value="s.value"
            :hidden="!s.show"
            :disabled="s.value == undefined"
            class="bg-background"
          >
            {{
              s.label ??
              (typeof s?.value == "number"
                ? (s.value * 100).toFixed(1).replace(/[.,]0$/, "") + "%"
                : "-------------")
            }}
          </option>
        </template>
      </select>
    </label>
  </div>
</template>
