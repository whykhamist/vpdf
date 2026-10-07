import { computed, inject, type Component, type ComputedRef, type Ref } from 'vue'
import { VPDF_VIEWER_KEY } from '../types/context'
import {
  VPDF_UI_SLOTS,
  type VPdfUiComponents,
  type VPdfUiSlot,
} from '../types/ui'
import { VPDF_UI_DEFAULTS, VPDF_UI_HOST_KEY } from './uiDefaults'

export type { VPdfUiComponents, VPdfUiSlot }
export { VPDF_UI_SLOTS, VPDF_UI_DEFAULTS, VPDF_UI_HOST_KEY }

export function useVPdfUi(): ComputedRef<VPdfUiComponents> {
  const host = inject(VPDF_UI_HOST_KEY, undefined)
  const viewer = inject(VPDF_VIEWER_KEY, undefined)
  return computed(() => {
    const resolved = { ...VPDF_UI_DEFAULTS }
    const pluginUi = viewer?.plugins.uiView.value
    if (pluginUi) {
      for (const slot of VPDF_UI_SLOTS) {
        const component = pluginUi[slot]
        if (component) resolved[slot] = component
      }
    }
    const hostUi = host?.value
    if (hostUi) {
      for (const slot of VPDF_UI_SLOTS) {
        const component = hostUi[slot]
        if (component) resolved[slot] = component
      }
    }
    return resolved
  })
}

export function useVPdfUiComponent(slot: VPdfUiSlot): ComputedRef<Component> {
  const ui = useVPdfUi()
  return computed(() => ui.value[slot])
}

export type { Ref }
