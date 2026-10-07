<script setup lang="ts">
import { computed } from "vue";
import type {
  VPdfAnnotationEditorKind,
  VPdfAnnotationEditorParams,
} from "../types";
import {
  ANNOTATION_EDITOR_FONT_SIZE,
  ANNOTATION_EDITOR_OPACITY,
  annotationEditorShowsFontSize,
  annotationEditorShowsNativeColor,
  annotationEditorShowsOpacity,
  annotationEditorShowsThickness,
  colorInputValue,
  thicknessRangeForEditor,
} from "../utils/annotationEditor";
import VPdfHighlightColorPicker from "./VPdfHighlightColorPicker.vue";
import VPdfIcon from "./VPdfIcon.vue";
import { VPdfButton } from "./ui";

const props = defineProps<{
  mode: Exclude<VPdfAnnotationEditorKind, "stamp">;
  label: string;
  title: string;
  icon: string;
  active: boolean;
  params: VPdfAnnotationEditorParams;
  onToggle: () => void;
  onUpdate: (patch: VPdfAnnotationEditorParams) => void;
}>();

const paramsId = computed(() => `vpdf-editor-${props.mode}-params`);
const thicknessRange = computed(() => thicknessRangeForEditor(props.mode));
const colorValue = computed(() => colorInputValue(props.params.color));
const fontSizeValue = computed(
  () => props.params.fontSize ?? ANNOTATION_EDITOR_FONT_SIZE.default,
);
const thicknessValue = computed(
  () => props.params.thickness ?? thicknessRange.value.default,
);
const opacityValue = computed(
  () => props.params.opacity ?? ANNOTATION_EDITOR_OPACITY.default,
);

function onColor(event: Event) {
  props.onUpdate({ color: (event.target as HTMLInputElement).value });
}

function onFontSize(event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  if (Number.isFinite(value)) props.onUpdate({ fontSize: value });
}

function onThickness(event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  if (Number.isFinite(value)) props.onUpdate({ thickness: value });
}

function onOpacity(event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  if (Number.isFinite(value)) props.onUpdate({ opacity: value });
}
</script>

<template>
  <div class="vpdf-annotation-tool">
    <VPdfButton
      :title="title"
      :aria-label="title"
      aria-haspopup="true"
      :aria-expanded="active"
      :aria-controls="paramsId"
      :aria-pressed="active"
      @click="onToggle()"
    >
      <VPdfIcon :name="icon" />
      <span class="vpdf-annotation-tool-label">{{ label }}</span>
    </VPdfButton>
    <div
      v-show="active"
      :id="paramsId"
      class="vpdf-annotation-params"
      role="toolbar"
      :aria-label="`${label} settings`"
      @pointerdown.stop
    >
      <VPdfHighlightColorPicker
        v-if="mode === 'highlight'"
        :color="params.color"
        @select="onUpdate({ color: $event })"
      />
      <label
        v-if="annotationEditorShowsNativeColor(mode)"
        class="vpdf-annotation-editor-control vpdf:justify-between"
      >
        <span class="">Color</span>
        <input
          type="color"
          :value="colorValue"
          title="Color"
          aria-label="Color"
          @input="onColor"
        />
      </label>
      <label
        v-if="annotationEditorShowsFontSize(mode)"
        class="vpdf-annotation-editor-control vpdf:justify-between"
      >
        <span aria-hidden="true">Size</span>
        <input
          type="range"
          :min="ANNOTATION_EDITOR_FONT_SIZE.min"
          :max="ANNOTATION_EDITOR_FONT_SIZE.max"
          :step="ANNOTATION_EDITOR_FONT_SIZE.step"
          :value="fontSizeValue"
          title="Font size"
          aria-label="Font size"
          @input="onFontSize"
        />
      </label>
      <label
        v-if="annotationEditorShowsThickness(mode)"
        class="vpdf-annotation-editor-control"
      >
        <span aria-hidden="true">Thickness</span>
        <input
          type="range"
          :min="thicknessRange.min"
          :max="thicknessRange.max"
          :step="thicknessRange.step"
          :value="thicknessValue"
          title="Thickness"
          aria-label="Thickness"
          @input="onThickness"
        />
      </label>
      <label
        v-if="annotationEditorShowsOpacity(mode)"
        class="vpdf-annotation-editor-control"
      >
        <span aria-hidden="true">Opacity</span>
        <input
          type="range"
          :min="ANNOTATION_EDITOR_OPACITY.min"
          :max="ANNOTATION_EDITOR_OPACITY.max"
          :step="ANNOTATION_EDITOR_OPACITY.step"
          :value="opacityValue"
          title="Opacity"
          aria-label="Opacity"
          @input="onOpacity"
        />
      </label>
    </div>
  </div>
</template>
