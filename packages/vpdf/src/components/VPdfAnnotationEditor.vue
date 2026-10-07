<script setup lang="ts">
import { computed } from "vue";
import { VPDF_ICON_SLOTS } from "../icons";
import type { VPdfAnnotationEditorProps } from "../types";
import {
  annotationEditorShowsHighlightPresets,
  annotationEditorShowsNativeColor,
  colorInputValue,
} from "../utils/annotationEditor";
import VPdfHighlightColorPicker from "./VPdfHighlightColorPicker.vue";
import VPdfIcon from "./VPdfIcon.vue";
import { VPdfButton } from "./ui";

const props = defineProps<VPdfAnnotationEditorProps>();

const showPresets = computed(() =>
  annotationEditorShowsHighlightPresets(props.editorType),
);
const showNativeColor = computed(() =>
  annotationEditorShowsNativeColor(props.editorType),
);
const colorValue = computed(() => colorInputValue(props.params.color));

function onColor(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  props.actions.update({ color: value });
}
</script>

<template>
  <div
    class="vpdf-annotation-editor"
    role="toolbar"
    aria-label="Annotation editor"
    @pointerdown.stop
  >
    <VPdfHighlightColorPicker
      v-if="showPresets"
      :color="params.color"
      @select="actions.update({ color: $event })"
    />
    <label v-if="showNativeColor" class="vpdf-annotation-editor-control">
      <span class="vpdf-sr-only">Color</span>
      <input
        type="color"
        :value="colorValue"
        title="Color"
        aria-label="Color"
        class="vpdf:size-8! vpdf:rounded-full"
        @input="onColor"
      />
    </label>
    <VPdfButton
      title="Delete annotation"
      aria-label="Delete annotation"
      :disabled="!canDelete"
      @click="actions.deleteSelected()"
    >
      <VPdfIcon :name="VPDF_ICON_SLOTS.editorDelete" />
    </VPdfButton>
  </div>
</template>
