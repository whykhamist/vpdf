import type {
  VPdfAnnotationEditorKind,
  VPdfAnnotationEditorMode,
  VPdfAnnotationEditorParams,
  VPdfAnnotationEditorUi,
} from '../types'

/** PDF.js AnnotationEditorParamsType values used by the custom editor chrome. */
export const PDFJS_EDITOR_PARAMS = {
  FREETEXT_SIZE: 11,
  FREETEXT_COLOR: 12,
  FREETEXT_OPACITY: 13,
  INK_COLOR: 21,
  INK_THICKNESS: 22,
  INK_OPACITY: 23,
  INK_COLOR_AND_OPACITY: 24,
  HIGHLIGHT_COLOR: 31,
  HIGHLIGHT_THICKNESS: 32,
} as const

export function createInitialAnnotationEditorUi(): VPdfAnnotationEditorUi {
  return {
    isEditing: false,
    hasSelection: false,
    editorType: undefined,
    params: {},
  }
}

export function asAnnotationEditorKind(
  value: unknown,
): VPdfAnnotationEditorKind | undefined {
  if (
    value === 'freetext' ||
    value === 'highlight' ||
    value === 'ink' ||
    value === 'stamp'
  ) {
    return value
  }
  return undefined
}

export function editorKindFromMode(
  mode: VPdfAnnotationEditorMode,
): VPdfAnnotationEditorKind | undefined {
  return asAnnotationEditorKind(mode)
}

export function annotationParamsFromPdfjs(
  details: unknown,
): VPdfAnnotationEditorParams {
  if (!Array.isArray(details)) return {}
  const params: VPdfAnnotationEditorParams = {}
  for (const entry of details) {
    if (!Array.isArray(entry) || entry.length < 2) continue
    const type = entry[0]
    const value = entry[1]
    switch (type) {
      case PDFJS_EDITOR_PARAMS.FREETEXT_COLOR:
      case PDFJS_EDITOR_PARAMS.INK_COLOR:
      case PDFJS_EDITOR_PARAMS.HIGHLIGHT_COLOR:
        if (typeof value === 'string') params.color = value
        break
      case PDFJS_EDITOR_PARAMS.INK_COLOR_AND_OPACITY:
        if (value && typeof value === 'object') {
          const record = value as { color?: unknown; opacity?: unknown }
          if (typeof record.color === 'string') params.color = record.color
          if (typeof record.opacity === 'number') params.opacity = record.opacity
        }
        break
      case PDFJS_EDITOR_PARAMS.FREETEXT_SIZE:
        if (typeof value === 'number') params.fontSize = value
        break
      case PDFJS_EDITOR_PARAMS.INK_THICKNESS:
      case PDFJS_EDITOR_PARAMS.HIGHLIGHT_THICKNESS:
        if (typeof value === 'number') params.thickness = value
        break
      case PDFJS_EDITOR_PARAMS.FREETEXT_OPACITY:
      case PDFJS_EDITOR_PARAMS.INK_OPACITY:
        if (typeof value === 'number') params.opacity = value
        break
      default:
        break
    }
  }
  return params
}

export function pdfjsCommandsForParams(
  editorType: VPdfAnnotationEditorKind | undefined,
  patch: VPdfAnnotationEditorParams,
): Array<{ type: number; value: unknown }> {
  const commands: Array<{ type: number; value: unknown }> = []
  if (patch.color !== undefined) {
    const type =
      editorType === 'freetext'
        ? PDFJS_EDITOR_PARAMS.FREETEXT_COLOR
        : editorType === 'ink'
          ? PDFJS_EDITOR_PARAMS.INK_COLOR
          : editorType === 'highlight'
            ? PDFJS_EDITOR_PARAMS.HIGHLIGHT_COLOR
            : undefined
    if (type !== undefined) commands.push({ type, value: patch.color })
  }
  if (patch.fontSize !== undefined && editorType === 'freetext') {
    commands.push({ type: PDFJS_EDITOR_PARAMS.FREETEXT_SIZE, value: patch.fontSize })
  }
  if (patch.thickness !== undefined) {
    const type =
      editorType === 'ink'
        ? PDFJS_EDITOR_PARAMS.INK_THICKNESS
        : editorType === 'highlight'
          ? PDFJS_EDITOR_PARAMS.HIGHLIGHT_THICKNESS
          : undefined
    if (type !== undefined) commands.push({ type, value: patch.thickness })
  }
  if (patch.opacity !== undefined && editorType === 'ink') {
    commands.push({ type: PDFJS_EDITOR_PARAMS.INK_OPACITY, value: patch.opacity })
  }
  return commands
}

export function annotationEditorShowsNativeColor(
  editorType: VPdfAnnotationEditorKind | undefined,
): boolean {
  return editorType === 'freetext' || editorType === 'ink'
}

export function annotationEditorShowsHighlightPresets(
  editorType: VPdfAnnotationEditorKind | undefined,
): boolean {
  return editorType === 'highlight'
}

export function annotationEditorShowsColor(
  editorType: VPdfAnnotationEditorKind | undefined,
): boolean {
  return annotationEditorShowsNativeColor(editorType) || annotationEditorShowsHighlightPresets(editorType)
}

export function annotationEditorShowsFontSize(
  editorType: VPdfAnnotationEditorKind | undefined,
): boolean {
  return editorType === 'freetext'
}

export function annotationEditorShowsThickness(
  editorType: VPdfAnnotationEditorKind | undefined,
): boolean {
  return editorType === 'ink' || editorType === 'highlight'
}

export function annotationEditorShowsOpacity(
  editorType: VPdfAnnotationEditorKind | undefined,
): boolean {
  return editorType === 'ink'
}

export const ANNOTATION_HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FFFF98' },
  { name: 'Green', value: '#53FFBC' },
  { name: 'Blue', value: '#80EBFF' },
  { name: 'Pink', value: '#FFCBE6' },
  { name: 'Red', value: '#FF4F5F' },
] as const

export const ANNOTATION_EDITOR_FONT_SIZE = { min: 5, max: 100, step: 1, default: 10 } as const
export const ANNOTATION_EDITOR_HIGHLIGHT_THICKNESS = { min: 8, max: 24, step: 1, default: 12 } as const
export const ANNOTATION_EDITOR_INK_THICKNESS = { min: 1, max: 20, step: 1, default: 1 } as const
export const ANNOTATION_EDITOR_OPACITY = { min: 0.05, max: 1, step: 0.05, default: 1 } as const

export function thicknessRangeForEditor(
  editorType: VPdfAnnotationEditorKind | undefined,
) {
  return editorType === 'highlight'
    ? ANNOTATION_EDITOR_HIGHLIGHT_THICKNESS
    : ANNOTATION_EDITOR_INK_THICKNESS
}

export function findVisibleAnnotationEditorToolbar(
  root: ParentNode | undefined | null,
): HTMLElement | undefined {
  if (!root) return undefined
  return root.querySelector<HTMLElement>('.editToolbar:not(.hidden)') ?? undefined
}

export function colorInputValue(color: string | undefined): string {
  if (!color) return '#000000'
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) return color
  if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
    const r = color[1]
    const g = color[2]
    const b = color[3]
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return '#000000'
}

export function colorsMatch(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false
  return colorInputValue(a).toLowerCase() === colorInputValue(b).toLowerCase()
}
