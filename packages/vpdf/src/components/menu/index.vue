<script setup lang="ts">
import { computed, defineAsyncComponent, ref, PropType } from "vue";
const Button = defineAsyncComponent(() => import("../button/index.vue"));
const Pager = defineAsyncComponent(() => import("./pager.vue"));
const Zoomer = defineAsyncComponent(() => import("./zoomer.vue"));

const props = defineProps({
  page: { type: Number, default: 1 },
  pages: { type: Number, default: 0 },
  scale: { type: Number, default: 1.0 },
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
  <div class="relative flex items-center justify-center bg-foreground/5">
    <slot name="prepend" />
    <div class="flex-auto">
      <div class="px-2">
        <Button
          v-if="false"
          class="rounded-lg px-1 py-0.5 text-2xl"
          :icon="sidebar ? 'menu_open' : 'menu'"
          :disabled="disabled"
          @click="_sidebar = !_sidebar"
        />
      </div>
    </div>
    <div
      class="flex flex-auto items-center justify-center divide-x divide-foreground/25 px-3 py-1 *:border-foreground/25 first:*:!border-l last:*:!border-r"
    >
      <div class="px-2">
        <Button
          class="group rounded-lg px-1 py-0.5 text-2xl"
          :icon="mode == 'vertical' ? 'table_rows' : 'view_column'"
          :disabled="disabled"
          @click="toggleViewMode"
        />
      </div>
      <Pager v-model="_page" :pages="pages" :mode="mode" :disabled="disabled" />
      <Zoomer
        ref="zoomer"
        v-model:scale="_scale"
        :disabled="disabled"
        @fitPage="(e) => emit('fitPage', e)"
      />
      <div class="px-2">
        <Button
          class="group rounded-lg px-1 py-0.5 text-2xl"
          icon="rotate_left"
          :disabled="disabled"
          @click="rotate(-90)"
        />
      </div>
    </div>
    <div class="flex flex-auto items-center justify-end px-3">
      <span
        v-if="loading"
        class="realtive block h-[1em] w-[1em] animate-mltShdSpin overflow-hidden rounded-full -indent-[9999em] text-sm leading-none text-black"
        style="transform: translateZ(0)"
      />
    </div>
    <slot name="append" />
  </div>
</template>
