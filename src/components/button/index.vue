<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const Icon = defineAsyncComponent(() => import("../icons/index.vue"));
const FocusHelper = defineAsyncComponent(
  () => import("../focusHelper/index.vue")
);

const props = withDefaults(
  defineProps<{
    label?: string;
    labelClass?: string | Object;
    icon?: string;
    iconClass?: string | Object;
    iconRight?: string;
    iconRightClass?: string | Object;
    disabled?: boolean;
    focusDisabled?: boolean;
  }>(),
  {
    labelClass: "uppercase leading-none flex-auto text-center",
    iconClass: "",
    iconRightClass: "",
    disabled: false,
    focusDisabled: false,
  }
);

const ripple = (e: MouseEvent) => {
  const x = e.offsetX;
  const y = e.offsetY;
  const ripples = document.createElement("span");
  ripples.setAttribute("style", `top: ${y}px; left: ${x}px`);
  ripples.className =
    "bg-white/75 absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-ripple pointer-events-none";
  (e.target as HTMLElement).appendChild(ripples);
  setTimeout(() => ripples.remove(), 250);
};
</script>

<template>
  <button
    class="group/pdfbutton relative flex items-center justify-center gap-2 overflow-hidden outline-blue-700/25 disabled:cursor-not-allowed disabled:before:opacity-0"
    :disabled="disabled"
    @click="ripple"
  >
    <FocusHelper :disabled="disabled || focusDisabled" class="bg-black" />
    <slot>
      <div
        class="pointer-events-none flex items-center justify-center gap-2 leading-none"
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
