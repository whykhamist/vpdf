<script setup lang="ts">
import type { VPdfAttachment } from '../../types'
import VPdfIcon from '../../components/VPdfIcon.vue'

defineProps<{
  attachments: VPdfAttachment[]
  onDownload: (id: string, filename: string) => void | Promise<void>
}>()

function fileIconName(file: VPdfAttachment): string {
  const base = file.filename.replace(/^.*[/\\]/, '')
  const dot = base.lastIndexOf('.')
  const ext = dot > 0 ? base.slice(dot + 1).toLowerCase() : ''
  if (ext) return `file:${ext}`
  const subtype = file.contentType?.split(';')[0]?.split('/')[1]?.trim().toLowerCase()
  if (subtype) return `file:${subtype}`
  return 'file:generic'
}
</script>

<template>
  <div class="vpdf-attachments">
    <button
      v-for="file in attachments"
      :key="file.id"
      type="button"
      class="vpdf-attachment"
      @click="onDownload(file.id, file.filename)"
    >
      <span class="vpdf-attachment-name">
        <VPdfIcon :name="fileIconName(file)" fallback="" />
        <span>{{ file.filename }}</span>
      </span>
      <span v-if="file.size" class="vpdf-text-muted">{{ Math.ceil(file.size / 1024) }} KB</span>
    </button>
    <p v-if="attachments.length === 0" class="vpdf-text-muted">No attachments</p>
  </div>
</template>
