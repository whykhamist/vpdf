<script setup lang="ts">
import type { VPdfErrorEvent, VPdfLoadState, VPdfProgressEvent } from '../types'

defineProps<{
  loadState: VPdfLoadState
  progress: VPdfProgressEvent
  error?: VPdfErrorEvent
}>()
</script>

<template>
  <div v-if="loadState === 'loading'" class="vpdf-status" role="status" aria-live="polite">
    <div class="vpdf-spinner" aria-hidden="true" />
    <p>Loading PDF…</p>
    <p v-if="progress.total > 0" class="vpdf-text-muted">
      {{ Math.min(100, Math.round((progress.loaded / progress.total) * 100)) }}%
    </p>
  </div>

  <div v-else-if="loadState === 'idle'" class="vpdf-status" role="status">
    <p>No document loaded</p>
    <p class="vpdf-text-muted">Provide a PDF URL, File, or Blob to get started.</p>
  </div>

  <div v-else-if="loadState === 'error'" class="vpdf-status vpdf-status-error" role="alert">
    <p>Could not open this PDF</p>
    <p class="vpdf-text-muted">{{ error?.message ?? 'Unknown error' }}</p>
  </div>

  <div v-else-if="loadState === 'unsupported'" class="vpdf-status vpdf-status-error" role="alert">
    <p>Unsupported document features</p>
    <p class="vpdf-text-muted">{{ error?.message ?? 'This PDF uses features that are not available with the current settings.' }}</p>
  </div>
</template>
