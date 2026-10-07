import { toValue } from 'vue'
import type { VPdfToolbarFeatures, VPdfViewerOptions } from '../types'
import type { VPdfPluginDefinition } from './types'
import { DEFAULT_FEATURES, DEFAULT_TOOLBAR } from '../utils/defaults'

export function resolvePluginFlag(value: unknown): boolean {
  return Boolean(toValue(value as never))
}

export function isPluginItemVisible(item: { visible?: unknown }): boolean {
  return item.visible === undefined || resolvePluginFlag(item.visible)
}

export function resolveToolbarFeatures(options: VPdfViewerOptions): VPdfToolbarFeatures | false {
  if (options.toolbar === false) return false
  return { ...DEFAULT_TOOLBAR, ...options.toolbar }
}

export function isToolbarFeatureEnabled(
  options: VPdfViewerOptions,
  feature: keyof VPdfToolbarFeatures,
): boolean {
  const toolbar = resolveToolbarFeatures(options)
  if (!toolbar) return false
  return Boolean(toolbar[feature])
}

export function isFeatureEnabled(
  options: VPdfViewerOptions,
  feature: keyof typeof DEFAULT_FEATURES,
): boolean {
  const features = { ...DEFAULT_FEATURES, ...options.features }
  return Boolean(features[feature])
}

export function pluginItemProps(
  item: { props?: unknown },
): Record<string, unknown> {
  return toValue(item.props as never) ?? {}
}

export function mergeViewerPlugins(
  builtins: VPdfPluginDefinition[],
  userPlugins: VPdfPluginDefinition[] = [],
): VPdfPluginDefinition[] {
  const replacements = new Map(userPlugins.map((plugin) => [plugin.id, plugin]))
  const builtinIds = new Set(builtins.map((plugin) => plugin.id))
  return [
    ...builtins.map((plugin) => replacements.get(plugin.id) ?? plugin),
    ...userPlugins.filter((plugin) => !builtinIds.has(plugin.id)),
  ]
}
