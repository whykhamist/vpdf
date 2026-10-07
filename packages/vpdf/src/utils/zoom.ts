export const MIN_SCALE = 0.25
export const MAX_SCALE = 8

export const ZOOM_PERCENT_PRESETS = [25, 50, 75, 100, 125, 150, 200, 300, 400, 800] as const

export const ZOOM_FIT_PRESETS = [
  { value: 'page-fit', label: 'Fit page' },
  { value: 'page-width', label: 'Fit width' },
  { value: 'page-height', label: 'Fit height' },
] as const

export type VPdfZoomFitValue = (typeof ZOOM_FIT_PRESETS)[number]['value']

const FIT_VALUES = new Set<string>(ZOOM_FIT_PRESETS.map((item) => item.value))
const PERCENT_VALUES = new Set(ZOOM_PERCENT_PRESETS.map((percent) => scaleValueFromPercent(percent)))

export function scaleValueFromPercent(percent: number): string {
  return String(percent / 100)
}

export function isFitPreset(value: string | undefined): value is VPdfZoomFitValue {
  return value !== undefined && FIT_VALUES.has(value)
}

export function percentFromScale(scale: number): number {
  return Math.round(scale * 100)
}

export function scaleSelectValue(scale: number, preset?: string): string {
  if (isFitPreset(preset)) return preset
  const percent = percentFromScale(scale)
  return scaleValueFromPercent(percent)
}

export function isPresetPercentValue(value: string): boolean {
  return PERCENT_VALUES.has(value)
}

export function parseScaleSelectValue(value: string): number | string {
  if (isFitPreset(value)) return value
  const scale = Number(value)
  if (!Number.isFinite(scale) || scale <= 0) return 1
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
}
