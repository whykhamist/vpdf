<script setup lang="ts">
import {
  ANNOTATION_HIGHLIGHT_COLORS,
  colorsMatch,
} from "../utils/annotationEditor";

const props = defineProps<{
  color?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  select: [color: string];
}>();

function onKeydown(event: KeyboardEvent) {
  const buttons = Array.from(
    (event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>(
      "button[data-color]",
    ),
  );
  if (buttons.length === 0) return;
  const currentIndex = buttons.findIndex(
    (button) => button === document.activeElement,
  );
  let nextIndex = currentIndex;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % buttons.length;
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    nextIndex =
      currentIndex < 0
        ? buttons.length - 1
        : (currentIndex - 1 + buttons.length) % buttons.length;
  } else if (event.key === "Home") {
    nextIndex = 0;
  } else if (event.key === "End") {
    nextIndex = buttons.length - 1;
  } else {
    return;
  }
  event.preventDefault();
  buttons[nextIndex]?.focus();
}
</script>

<template>
  <div
    class="vpdf-highlight-swatches"
    role="listbox"
    aria-label="Highlight color"
    @keydown="onKeydown"
  >
    <button
      v-for="swatch in ANNOTATION_HIGHLIGHT_COLORS"
      :key="swatch.value"
      type="button"
      class="vpdf-highlight-swatch"
      role="option"
      :data-color="swatch.value"
      :title="swatch.name"
      :aria-label="swatch.name"
      :aria-selected="colorsMatch(color, swatch.value)"
      :disabled="disabled"
      :style="{ '--vpdf-swatch': swatch.value }"
      @click="emit('select', swatch.value)"
    />
  </div>
</template>
