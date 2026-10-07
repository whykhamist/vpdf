<script setup lang="ts">
import type { VPdfAnnotationEditorProps } from "@whykhamist/vpdf";

defineProps<VPdfAnnotationEditorProps>();
</script>

<template>
  <div role="toolbar" aria-label="Annotation editor">
    <input
      type="color"
      :value="params.color"
      aria-label="Color"
      @input="
        actions.update({
          color: ($event.target as HTMLInputElement).value,
        })
      "
    />
    <button
      type="button"
      class="cursor-pointer"
      :disabled="!canDelete"
      @click="actions.deleteSelected()"
    >
      Delete
    </button>
  </div>
</template>
