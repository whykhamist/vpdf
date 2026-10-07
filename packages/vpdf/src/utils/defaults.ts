import type {
  VPdfLoadState,
  VPdfSearchState,
  VPdfSidebarPanel,
  VPdfViewerState,
} from '../types'
import { createInitialAnnotationEditorUi } from './annotationEditor'

export function createInitialSearchState(): VPdfSearchState {
  return {
    query: '',
    matchCount: 0,
    currentMatch: 0,
    caseSensitive: false,
    entireWord: false,
    highlightAll: true,
    matchDiacritics: false,
    findPrevious: false,
    status: 'idle',
  }
}

/** Overlay (and closed-by-default) when viewport width is this or smaller. */
export const SIDEBAR_OVERLAY_MAX_PX = 1024

export function resolveInitialSidebar(
  sidebar?: VPdfSidebarPanel,
): VPdfSidebarPanel {
  if (sidebar !== undefined) return sidebar
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'none'
  }
  return window.matchMedia(`(min-width: ${SIDEBAR_OVERLAY_MAX_PX + 1}px)`).matches
    ? 'thumbnails'
    : 'none'
}

export function createInitialViewerState(
  sidebar: VPdfSidebarPanel = 'none',
): VPdfViewerState {
  return {
    loadState: 'idle' as VPdfLoadState,
    pageNumber: 1,
    pageCount: 0,
    scale: 1,
    scalePreset: undefined,
    rotation: 0,
    sidebar,    annotationEditorMode: 'none',
    annotationEditor: createInitialAnnotationEditorUi(),
    search: createInitialSearchState(),
    progress: { loaded: 0, total: 0 },
    outline: [],
    attachments: [],
    hasModifications: false,
  }
}

export const DEFAULT_TOOLBAR = {
  download: true,
  search: true,
  zoom: true,
  rotate: true,
  pageNav: true,
  sidebar: true,
  annotations: true,
  documentProperties: true,
} as const

export const DEFAULT_FEATURES = {
  textLayer: true,
  annotationLayer: true,
  xfa: true,
  search: true,
  thumbnails: true,
  outline: true,
  attachments: true,
  annotations: true,
  scripting: false,
} as const

export const DEFAULT_EXTERNAL_LINKS = {
  enabled: true,
  target: '_blank' as const,
  rel: 'noopener noreferrer nofollow',
}

/** Space between pages in px. */
export const DEFAULT_PAGE_GAP = 10
/** Page corner radius in px. 0 = square (no radius/border/shadow). */
export const DEFAULT_PAGE_RADIUS = 10
/** Top inset in px when scrolling to a destination. */
export const DEFAULT_DESTINATION_OFFSET = 20

/** Map PDF.js AnnotationEditorType-like values to package modes */
export const EDITOR_MODE_TO_PDFJS: Record<string, number> = {
  none: 0,
  freetext: 3,
  highlight: 9,
  stamp: 13,
  ink: 15,
}

export const PDFJS_TO_EDITOR_MODE: Record<number, string> = {
  0: 'none',
  3: 'freetext',
  9: 'highlight',
  13: 'stamp',
  15: 'ink',
}
