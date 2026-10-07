<script setup lang="ts">
import DocsViewer from "../components/DocsViewer.vue";
import { DemoMarksPlugin } from "./demoMarksPlugin";

const plugins = {
  plugins: [DemoMarksPlugin()],
};
</script>

<template>
  <DocsViewer :plugins="plugins" />
</template>
