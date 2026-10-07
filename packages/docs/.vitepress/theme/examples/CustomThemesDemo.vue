<script setup lang="ts">
import { ref } from "vue";
import DocsViewer from "../components/DocsViewer.vue";

const theme = ref("vpdf-light");
const themes = [
  { label: "Light", value: "vpdf-light" },
  { label: "Light (rich)", value: "vpdf-light-rich" },
  { label: "Dark", value: "vpdf-dark" },
  { label: "Sepia", value: "vpdf-sepia" },
  { label: "Sepia (rich)", value: "vpdf-sepia-rich" },
  { label: "Sepia (dark)", value: "vpdf-sepia-dark" },
  { label: "Slate", value: "vpdf-slate" },
  { label: "Slate (rich)", value: "vpdf-slate-rich" },
  { label: "Slate (dark)", value: "vpdf-slate-dark" },
  { label: "Ocean", value: "vpdf-ocean" },
  { label: "Ocean (rich)", value: "vpdf-ocean-rich" },
  { label: "Ocean (dark)", value: "vpdf-ocean-dark" },
  { label: "Forest", value: "vpdf-forest" },
  { label: "Forest (rich)", value: "vpdf-forest-rich" },
  { label: "Forest (dark)", value: "vpdf-forest-dark" },
  { label: "Rose", value: "vpdf-rose" },
  { label: "Rose (rich)", value: "vpdf-rose-rich" },
  { label: "Rose (dark)", value: "vpdf-rose-dark" },
  { label: "Amber", value: "vpdf-amber" },
  { label: "Amber (rich)", value: "vpdf-amber-rich" },
  { label: "Amber (dark)", value: "vpdf-amber-dark" },
];
</script>

<template>
  <div>
    <div class="docs-vpdf-controls">
      <label class="docs-vpdf-label">
        Theme
        <select v-model="theme" class="docs-vpdf-select">
          <option v-for="item in themes" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </label>
    </div>
    <DocsViewer :class="theme" />
  </div>
</template>
