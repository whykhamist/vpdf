<script setup lang="ts">
import { computed, inject } from 'vue'
import { isVPdfSvgFallback, VPDF_ICON_FALLBACKS, type VPdfIconSlot } from '../icons'
import { VPDF_VIEWER_KEY } from '../types/context'

const props = defineProps<{
  name: string
  /** Empty string renders nothing when no icon renderer is registered. */
  fallback?: string
}>()

const viewer = inject(VPDF_VIEWER_KEY, undefined)
const renderer = computed(() => viewer?.plugins.iconRendererView.value)

const fallbackText = computed(() => {
  if (props.fallback === '') return undefined
  if (props.fallback !== undefined) return props.fallback
  return VPDF_ICON_FALLBACKS[props.name as VPdfIconSlot]
})

const fallbackIsSvg = computed(() => isVPdfSvgFallback(fallbackText.value))
</script>

<template>
  <component
    :is="renderer"
    v-if="renderer"
    class="vpdf-icon"
    :name="name"
    :fallback="fallbackText"
    aria-hidden="true"
  />
  <span
    v-else-if="fallbackIsSvg"
    class="vpdf-icon vpdf-icon-fallback"
    aria-hidden="true"
    v-html="fallbackText"
  />
  <span
    v-else-if="fallbackText"
    class="vpdf-icon vpdf-icon-fallback"
    aria-hidden="true"
  >{{ fallbackText }}</span>
</template>
