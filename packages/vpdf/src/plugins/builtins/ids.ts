export const VPDF_BUILTIN_PLUGIN_IDS = {
  navigation: 'vpdf.navigation',
  zoom: 'vpdf.zoom',
  rotate: 'vpdf.rotate',
  search: 'vpdf.search',
  annotations: 'vpdf.annotations',
  download: 'vpdf.download',
  thumbnails: 'vpdf.thumbnails',
  outline: 'vpdf.outline',
  attachments: 'vpdf.attachments',
  documentProperties: 'vpdf.documentProperties',
} as const

export type VPdfBuiltinPluginId =
  (typeof VPDF_BUILTIN_PLUGIN_IDS)[keyof typeof VPDF_BUILTIN_PLUGIN_IDS]
