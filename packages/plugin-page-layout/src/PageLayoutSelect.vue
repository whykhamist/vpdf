<script setup lang="ts">
import { VPdfSelect } from '@whykhamist/vpdf'

type PageLayoutMode = 'vertical' | 'horizontal' | 'two-column' | 'wrapped' | 'single-page'

const PAGE_LAYOUT_OPTIONS: ReadonlyArray<{ value: PageLayoutMode; label: string }> = [
  { value: 'vertical', label: 'Vertical' },
  { value: 'single-page', label: 'Single page' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'two-column', label: 'Two columns' },
  { value: 'wrapped', label: 'Fill width' },
]

defineProps<{
  mode: PageLayoutMode
  disabled?: boolean
  onChange: (mode: PageLayoutMode) => void
}>()
</script>

<template>
  <label class="vpdf-layout-select">
    <span class="vpdf-sr-only">Page layout</span>
    <VPdfSelect
      :model-value="mode"
      :disabled="disabled"
      title="Page layout"
      aria-label="Page layout"
      @update:model-value="onChange($event as PageLayoutMode)"
    >
      <option
        v-for="option in PAGE_LAYOUT_OPTIONS"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </VPdfSelect>
  </label>
</template>
