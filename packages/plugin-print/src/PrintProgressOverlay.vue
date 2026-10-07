<script setup lang="ts">
import { computed } from 'vue'
import { VPdfButton } from '@whykhamist/vpdf'

const props = defineProps<{
  progress: { page: number; total: number }
  onCancel: () => void
}>()

const percent = computed(() => {
  if (props.progress.total <= 0) return 0
  return Math.min(100, Math.round((props.progress.page / props.progress.total) * 100))
})
</script>

<template>
  <div class="vpdf-status" role="status" aria-live="polite">
    <div class="vpdf-spinner" aria-hidden="true" />
    <p>Preparing document for printing…</p>
    <p class="vpdf-text-muted">
      <template v-if="progress.page > 0">
        Page {{ progress.page }} of {{ progress.total }} ({{ percent }}%)
      </template>
      <template v-else>
        Starting… ({{ progress.total }} pages)
      </template>
    </p>
    <VPdfButton class="vpdf:mt-2" @click="onCancel">
      Cancel
    </VPdfButton>
  </div>
</template>
