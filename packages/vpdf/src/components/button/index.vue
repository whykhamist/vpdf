<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const Icon = defineAsyncComponent(() => import("../icons/index.vue"));
const FocusHelper = defineAsyncComponent(
  () => import("../focusHelper/index.vue"),
);

const props = withDefaults(
  defineProps<{
    label?: string;
    labelClass?: string | object;
    icon?: string;
    iconClass?: string | object;
    iconRight?: string;
    iconRightClass?: string | object;
    disabled?: boolean;
    focusDisabled?: boolean;
  }>(),
  {
    labelClass: "uppercase leading-none flex-auto text-center",
    iconClass: "",
    iconRightClass: "",
    disabled: false,
    focusDisabled: false,
  },
);

const ripple = (e: MouseEvent) => {
  const x = e.offsetX;
  const y = e.offsetY;
  const ripples = document.createElement("span");
  ripples.setAttribute("style", `top: ${y}px; left: ${x}px`);
  ripples.className =
    "vpdf:bg-white/75 vpdf:absolute vpdf:-translate-x-1/2 vpdf:-translate-y-1/2 vpdf:rounded-full vpdf:animate-ripple vpdf:pointer-events-none";
  (e.target as HTMLElement).appendChild(ripples);
  setTimeout(() => ripples.remove(), 250);
};
</script>

<template>
  <button
    class="vpdf:relative vpdf:flex vpdf:items-center vpdf:justify-center vpdf:gap-2 vpdf:overflow-hidden vpdf:rounded-lg vpdf:px-1 vpdf:py-0.5 vpdf:text-3xl vpdf:outline-primary vpdf:disabled:cursor-not-allowed vpdf:disabled:text-foreground/30 vpdf:md:text-2xl"
    :disabled="disabled"
    @click="ripple"
  >
    <FocusHelper
      :disabled="disabled || focusDisabled"
      class="vpdf:bg-primary"
    />
    <slot>
      <div
        class="vpdf:pointer-events-none vpdf:flex vpdf:items-center vpdf:justify-center vpdf:gap-2 vpdf:leading-none"
      >
        <Icon
          v-if="!!icon"
          :key="`__PDF_BUTTON_ICON_${icon}_LEFT__`"
          :name="icon"
          :class="iconClass"
        />
        <span v-if="!!label" :class="labelClass">{{ label }}</span>
        <Icon
          v-if="!!iconRight"
          :key="`__PDF_BUTTON_ICON_${iconRight}_RIGHT__`"
          :name="iconRight"
          :class="iconRightClass"
        />
      </div>
    </slot>
  </button>
</template>
