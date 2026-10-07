# Custom annotation editor

Replace the built-in inline editor by registering `VpdfAnnotationsPlugin` with the same id (`vpdf.annotations`).

<CustomEditorDemo />

```vue
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
```

```ts
import { VpdfAnnotationsPlugin } from "@whykhamist/vpdf";
import CustomEditor from "./CustomEditor.vue";

const plugins = {
  plugins: [
    VpdfAnnotationsPlugin({
      editorComponent: CustomEditor,
    }),
  ],
};
```

PDF.js still owns resize, undo, and `saveDocument`. Your component only replaces the themed Vue toolbar teleported into `.editToolbar`.
