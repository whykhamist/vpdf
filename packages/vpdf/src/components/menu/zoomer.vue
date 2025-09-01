<script setup lang="ts">
import { computed, defineAsyncComponent, watch } from "vue";
import type { ScaleOptions } from "../../types/scales";
import { uniqid, useScales } from "../../composables";

const Button = defineAsyncComponent(() => import("../button/index.vue"));
const props = withDefaults(
  defineProps<{
    scale: number;
    scales?: ScaleOptions;
    disabled?: boolean;
    ui?: {
      select?: string;
      btn?: string;
    };
    hideButtons?: boolean;
    hideSelection?: boolean;
  }>(),
  {
    scale: 1,
    ui: () => ({
      select: "vpdf:bg-background-200 vpdf:text-foreground",
      btn: "",
    }),
  },
);

const emit = defineEmits(["update:scale", "fitPage"]);

const zoomerId = uniqid();

const {
  scale: _scale,
  scales: _scales,
  canNext,
  canPrev,
  next,
  prev,
  appendFitters,
} = useScales(
  computed(() => props.scale),
  {
    scales: props.scales,
  },
);

const onScaleSelect = (e: Event) => {
  let val = (e.target as HTMLInputElement).value;
  isNaN(+val) ? emit("fitPage", val) : emit("update:scale", +val);
};

watch(_scale, (val) => {
  emit("update:scale", val);
});
</script>

<template>
  <div
    v-if="!hideButtons || !hideSelection"
    class="vpdf:flex vpdf:items-center vpdf:justify-center vpdf:gap-0.5 vpdf:px-2"
  >
    <template v-if="!hideButtons">
      <Button
        icon="zoom_out"
        :class="ui.btn"
        :disabled="!canPrev || disabled"
        @click="prev"
      />
      <Button
        icon="zoom_in"
        :class="ui.btn"
        :disabled="!canNext || disabled"
        @click="next"
      />
    </template>
    <label
      v-if="!hideSelection"
      :for="zoomerId"
      class="vpdf:efore:top-full vpdf:relative vpdf:max-w-24 vpdf:rounded-t-md vpdf:leading-none vpdf:before:absolute vpdf:before:inset-x-0 vpdf:before:h-0.5 vpdf:md:block"
    >
      <select
        :id="zoomerId"
        class="vpdf:max-w-full vpdf:bg-background vpdf:text-center vpdf:leading-none vpdf:text-foreground vpdf:outline-none"
        :class="ui.select"
        :value="scale"
        :disabled="disabled"
        @change="onScaleSelect"
      >
        <template
          v-if="_scales.findIndex((s) => s.value == scale || scale < 0) == -1"
        >
          <option :value="scale" hidden>
            {{ (scale * 100).toFixed(1).replace(/[.,]0$/, "") + "%" }}
          </option>
        </template>
        <template v-for="s in appendFitters(_scales)" :key="`${s}`">
          <option
            :value="s.value"
            :hidden="!s.show"
            :disabled="s.value == undefined"
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
