import type { VPdfPluginToolbarPlacement } from '../plugins/types'

export const TOOLBAR_OVERFLOW_MAX = {
  annotations: 1024,
  secondaryEnd: 880,
  tools: 720,
  zoom: 560,
} as const

function itemKey(id: string): string {
  const colon = id.lastIndexOf(':')
  return colon === -1 ? id : id.slice(colon + 1)
}

export function toolbarItemOverflows(
  item: { id: string; placement?: VPdfPluginToolbarPlacement },
  width: number,
): boolean {
  // ponytail: discrete width buckets, not measured overflow; upgrade to per-item measurement if plugins keep adding chrome.
  const placement = item.placement ?? 'end'
  if (placement === 'start') return false
  if (placement === 'overflow') return true

  const key = itemKey(item.id)
  if (placement === 'annotations') return width <= TOOLBAR_OVERFLOW_MAX.annotations
  if (placement === 'end' && key !== 'toggle') return width <= TOOLBAR_OVERFLOW_MAX.secondaryEnd
  if (key === 'zoom') return width <= TOOLBAR_OVERFLOW_MAX.zoom
  return width <= TOOLBAR_OVERFLOW_MAX.tools
}
