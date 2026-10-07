<script setup lang="ts">
import {
  isFitPreset,
  isPresetPercentValue,
  parseScaleSelectValue,
  percentFromScale,
  scaleSelectValue,
  ZOOM_FIT_PRESETS,
  ZOOM_PERCENT_PRESETS,
} from '../../utils/zoom'
import { VPDF_ICON_SLOTS } from '../../icons'
import VPdfIcon from '../../components/VPdfIcon.vue'
import { VPdfButton, VPdfSelect } from '../../components/ui'

const props = defineProps<{
  scale: number
  scalePreset?: string
  pageCount: number
  onZoomIn: () => void
  onZoomOut: () => void
  onSetScale: (scale: number | string) => void
}>()

const zoomValue = () => scaleSelectValue(props.scale, props.scalePreset)

function customZoomPercent(): number | undefined {
  const value = zoomValue()
  if (isFitPreset(value) || isPresetPercentValue(value)) return undefined
  return percentFromScale(props.scale)
}
</script>

<template>
  <span class="vpdf-toolbar-cluster">
    <VPdfButton title="Zoom out" aria-label="Zoom out" @click="onZoomOut()">
      <VPdfIcon :name="VPDF_ICON_SLOTS.zoomOut" />
    </VPdfButton>
    <label class="vpdf-zoom-select">
      <span class="vpdf-sr-only">Zoom</span>
      <VPdfSelect
        :model-value="zoomValue()"
        :disabled="pageCount < 1"
        title="Zoom"
        aria-label="Zoom"
        @update:model-value="onSetScale(parseScaleSelectValue($event))"
      >
        <optgroup label="Fit">
          <option v-for="item in ZOOM_FIT_PRESETS" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </optgroup>
        <optgroup label="Scale">
          <option
            v-if="customZoomPercent() !== undefined"
            :value="zoomValue()"
          >
            {{ customZoomPercent() }}%
          </option>
          <option
            v-for="percent in ZOOM_PERCENT_PRESETS"
            :key="percent"
            :value="String(percent / 100)"
          >
            {{ percent }}%
          </option>
        </optgroup>
      </VPdfSelect>
    </label>
    <VPdfButton title="Zoom in" aria-label="Zoom in" @click="onZoomIn()">
      <VPdfIcon :name="VPDF_ICON_SLOTS.zoomIn" />
    </VPdfButton>
  </span>
</template>
