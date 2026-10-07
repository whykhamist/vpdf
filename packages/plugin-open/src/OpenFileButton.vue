<script setup lang="ts">
import { VPDF_ICON_SLOTS, VPdfButton, VPdfIcon } from '@whykhamist/vpdf'
import { ref } from 'vue'

const props = defineProps<{
  disabled?: boolean
  onOpen: (file: File) => void | Promise<void>
}>()

const inputRef = ref<HTMLInputElement>()

function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  void props.onOpen(file)
}
</script>

<template>
  <span class="vpdf-toolbar-cluster">
    <input
      ref="inputRef"
      type="file"
      accept="application/pdf,.pdf"
      hidden
      :disabled="disabled"
      @change="onChange"
    >
    <VPdfButton
      title="Open PDF"
      aria-label="Open PDF"
      :disabled="disabled"
      @click="inputRef?.click()"
    >
      <VPdfIcon :name="VPDF_ICON_SLOTS.open" />
    </VPdfButton>
  </span>
</template>
