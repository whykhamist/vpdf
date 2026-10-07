<script setup>
import { ref, onMounted, watch } from "vue";
import mermaid from "mermaid";
import { useData } from "vitepress";

const props = defineProps({
  code: { type: String, required: true },
});

const svg = ref("");
const { isDark } = useData();

const renderDiagram = async () => {
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark.value ? "dark" : "default",
      securityLevel: "loose",
    });
    // Generate a unique ID for each graph
    const id = `mermaid-${Math.floor(Math.random() * 100000)}`;
    const { svg: renderedSvg } = await mermaid.render(id, props.code);
    svg.value = renderedSvg;
  } catch (error) {
    svg.value = `<pre class="error">${error}</pre>`;
  }
};

onMounted(() => {
  renderDiagram();
  // Re-render when theme switches between light and dark mode
  watch(isDark, () => {
    renderDiagram();
  });
});
</script>

<template>
  <div v-html="svg" class="mermaid-diagram"></div>
</template>
