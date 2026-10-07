<script setup lang="ts">
import { VpdfAnnotationsPlugin } from "@whykhamist/vpdf";
import DocsViewer from "../components/DocsViewer.vue";
import CustomEditor from "./CustomEditor.vue";

const plugins = {
  plugins: [
    VpdfAnnotationsPlugin({
      editorComponent: CustomEditor,
    }),
  ],
};
</script>

<template>
  <DocsViewer :plugins="plugins" />
</template>
