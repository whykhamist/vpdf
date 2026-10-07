<script setup lang="ts">
import { computed, onMounted, ref, useAttrs } from "vue";
import {
  VPdfViewer,
  type VPdfPluginsConfig,
  type VPdfSource,
  type VPdfViewerController,
  type VPdfViewerOptions,
} from "@whykhamist/vpdf";
import "@whykhamist/vpdf/style.css";
import { DEMO_PDF_URL, mergeDocsViewerOptions } from "../docsPdf";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    src?: VPdfSource;
    options?: VPdfViewerOptions;
    plugins?: VPdfPluginsConfig;
    themeClass?: string;
  }>(),
  {
    themeClass: "vpdf-auto",
  },
);

const attrs = useAttrs();

const mounted = ref(false);

const viewerRef = ref<{
  controller: VPdfViewerController;
}>();

const resolvedSrc = computed(() => props.src ?? DEMO_PDF_URL);
const mergedOptions = computed(() => mergeDocsViewerOptions(props.options));

onMounted(() => {
  mounted.value = true;
});

defineExpose({
  get controller() {
    return viewerRef.value?.controller;
  },
});
</script>

<template>
  <div class="docs-vpdf" :class="{ 'docs-vpdf--fallback': !mounted }">
    <VPdfViewer
      v-if="mounted"
      ref="viewerRef"
      v-bind="attrs"
      :src="resolvedSrc"
      :options="mergedOptions"
      :plugins="plugins"
      :class="themeClass"
    />
    <p v-else role="status">Loading viewer…</p>
  </div>
</template>
