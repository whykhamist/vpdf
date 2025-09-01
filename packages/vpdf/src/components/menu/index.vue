<script setup lang="ts">
import { computed, defineAsyncComponent, ref, type PropType } from "vue";
import type { ScaleOptions } from "../../types/scales";
const Button = defineAsyncComponent(() => import("../button/index.vue"));
const Pager = defineAsyncComponent(() => import("./pager.vue"));
const Zoomer = defineAsyncComponent(() => import("./zoomer.vue"));

const props = defineProps({
  page: { type: Number, default: 1 },
  pages: { type: Number, default: 0 },
  scale: { type: Number, default: 1.0 },
  scales: { type: Array as PropType<ScaleOptions>, default: () => [] },
  rotation: {
    type: Number,
    default: 0,
    validator: (val: number) => val % 90 == 0,
  },
  mode: {
    type: String as PropType<"vertical" | "horizontal">,
    default: "vertical",
  },
  sidebar: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:page",
  "update:mode",
  "update:scale",
  "update:sidebar",
  "update:rotation",
  "fitPage",
]);

const zoomer = ref<typeof Zoomer>();

const _scale = computed({
  get: () => props.scale,
  set: (v) => emit("update:scale", v),
});
const _scales = computed(() => zoomer.value?.scales);
const _page = computed({
  get: () => props.page,
  set: (v) => emit("update:page", v),
});
const _sidebar = computed({
  get: () => props.sidebar,
  set: (v) => emit("update:sidebar", v),
});
const _rotation = computed({
  get: () => props.rotation,
  set: (v) => emit("update:rotation", v),
});

const toggleViewMode = () => {
  emit("update:mode", props.mode == "vertical" ? "horizontal" : "vertical");
};

defineExpose({
  scales: _scales,
});

const rotate = (deg: number) => {
  if (deg % 90 != 0) return;
  const newDeg = (_rotation.value + deg) % 360;
  const constrainedDeg = Math.max(-270, Math.min(270, newDeg));

  emit("update:rotation", constrainedDeg);
};
</script>

<template>
  <div class="vpdf:relative vpdf:flex vpdf:items-center vpdf:justify-center">
    <slot name="prepend" />
    <div class="vpdf:flex-auto">
      <div class="vpdf:px-2">
        <Button
          :icon="sidebar ? 'menu_open' : 'menu'"
          :disabled="disabled"
          @click="_sidebar = !_sidebar"
        />
      </div>
    </div>
    <div
      class="vpdf:flex vpdf:flex-auto vpdf:items-center vpdf:justify-center vpdf:divide-x vpdf:divide-foreground/25 vpdf:px-3 vpdf:py-1 vpdf:*:border-foreground/25 vpdf:first:*:!border-l vpdf:last:*:!border-r"
    >
      <div class="px-2">
        <Button
          :icon="mode == 'vertical' ? 'table_rows' : 'view_column'"
          :disabled="disabled"
          @click="toggleViewMode"
        />
      </div>
      <Pager
        v-model="_page"
        :pages="pages"
        :mode="mode"
        :disabled="disabled"
        class="vpdf:hidden vpdf:sm:!flex"
      />
      <Zoomer
        ref="zoomer"
        v-model:scale="_scale"
        :disabled="disabled"
        :scales
        :ui="{
          btn: 'vpdf:sm:!flex vpdf:hidden',
        }"
        @fitPage="(e) => emit('fitPage', e)"
      />
      <div class="vpdf:px-2">
        <Button icon="rotate_left" :disabled="disabled" @click="rotate(-90)" />
      </div>
    </div>
    <div
      class="vpdf:flex vpdf:flex-auto vpdf:items-center vpdf:justify-end vpdf:px-3"
    >
      <span
        v-if="loading"
        class="vpdf:realtive vpdf:block vpdf:h-[1em] vpdf:w-[1em] vpdf:animate-mltShdSpin vpdf:overflow-hidden vpdf:rounded-full vpdf:-indent-[9999em] vpdf:text-sm vpdf:leading-none vpdf:text-foreground"
        style="transform: translateZ(0)"
      />
    </div>
    <slot name="append" />
  </div>
</template>
