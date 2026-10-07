<script setup lang="ts">
import type { DocumentPropertyRow } from './documentPropertiesMeta'
import { VPdfButton, VPdfCard } from '../../components/ui'

defineProps<{
  rows: DocumentPropertyRow[]
  status: 'loading' | 'ready' | 'error'
  errorMessage?: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <VPdfCard title="Document properties" class="vpdf-dialog-properties">
    <p v-if="status === 'loading'" class="vpdf-dialog-desc">
      Reading document properties…
    </p>
    <p v-else-if="status === 'error'" class="vpdf-dialog-desc vpdf-status-error">
      {{ errorMessage || 'Could not read some document properties.' }}
    </p>

    <dl v-if="status !== 'loading'" class="vpdf-dialog-meta">
      <div
        v-for="row in rows"
        :key="row.id"
        class="vpdf-dialog-meta-row"
      >
        <dt>{{ row.label }}</dt>
        <dd>{{ row.value }}</dd>
      </div>
    </dl>

    <template #footer>
      <VPdfButton
        variant="solid"
        aria-label="Close"
        @click="emit('close')"
      >
        Close
      </VPdfButton>
    </template>
  </VPdfCard>
</template>
