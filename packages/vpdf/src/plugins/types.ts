import type { Component, MaybeRefOrGetter, Ref } from 'vue'
import type { VPdfIconRenderer } from '../icons'
import type {
  VPdfAnnotationChangeEvent,
  VPdfAttachmentDownloadEvent,
  VPdfErrorEvent,
  VPdfPageChangeEvent,
  VPdfPageGeometry,
  VPdfPasswordRequest,
  VPdfPrepareDocumentInitEvent,
  VPdfProgressEvent,
  VPdfScaleChangeEvent,
  VPdfViewerController,
  VPdfViewerOptions,
  VPdfViewerState,
} from '../types'
import type { VPdfXfaThumbnailRasterizer } from '../utils/renderThumbnail'
import type { VPdfUiSlot } from '../types/ui'

export type VPdfPluginDisposer = () => void

export type VPdfPluginToolbarPlacement =
  | 'start'
  | 'center'
  | 'end'
  | 'annotations'
  | 'overflow'

interface VPdfPluginItemBase {
  id: string
  order?: number
  visible?: MaybeRefOrGetter<boolean>
}

interface VPdfPluginToolbarItemBase extends VPdfPluginItemBase {
  placement?: VPdfPluginToolbarPlacement
}

export interface VPdfPluginToolbarActionItem extends VPdfPluginToolbarItemBase {
  kind?: 'action'
  label: string
  title?: MaybeRefOrGetter<string>
  icon?: MaybeRefOrGetter<Component | string>
  disabled?: MaybeRefOrGetter<boolean>
  active?: MaybeRefOrGetter<boolean>
  onClick: () => void | Promise<void>
}

export interface VPdfPluginToolbarControlItem extends VPdfPluginToolbarItemBase {
  kind: 'control'
  component: Component
  props?: MaybeRefOrGetter<Record<string, unknown>>
}

export type VPdfPluginToolbarItem = VPdfPluginToolbarActionItem | VPdfPluginToolbarControlItem

export interface VPdfPluginPanel {
  id: string
  label: string
  title?: string
  icon?: MaybeRefOrGetter<Component | string>
  order?: number
  visible?: MaybeRefOrGetter<boolean>
  component: Component
  props?: MaybeRefOrGetter<Record<string, unknown>>
}

export interface VPdfPluginMenuItem {
  id: string
  label: string
  icon?: MaybeRefOrGetter<Component | string>
  order?: number
  visible?: MaybeRefOrGetter<boolean>
  disabled?: MaybeRefOrGetter<boolean>
  onClick: () => void | Promise<void>
}

export interface VPdfPluginShortcut {
  id: string
  /** Key matching KeyboardEvent.key, e.g. "s", "ArrowRight" */
  key: string
  ctrl?: boolean
  meta?: boolean
  alt?: boolean
  shift?: boolean
  preventDefault?: boolean
  when?: () => boolean
  handler: (event: KeyboardEvent) => void | Promise<void>
}

export interface VPdfPluginControl {
  id: string
  region: 'viewer-top' | 'viewer-bottom' | 'page-overlay-host'
  order?: number
  visible?: MaybeRefOrGetter<boolean>
  component: Component
  props?: MaybeRefOrGetter<Record<string, unknown>>
}

export interface VPdfPluginPageOverlay {
  id: string
  order?: number
  visible?: MaybeRefOrGetter<boolean>
  /** When omitted, renders on every page */
  pageNumbers?: number[]
  /**
   * Overlay components receive `pageNumber` as a prop.
   */
  component: Component
  props?: MaybeRefOrGetter<Record<string, unknown>>
}

export interface VPdfPluginModal {
  component: Component
  props?: MaybeRefOrGetter<Record<string, unknown>>
  busy?: MaybeRefOrGetter<boolean>
  dismissible?: MaybeRefOrGetter<boolean>
  restoreFocus?: HTMLElement
}

export interface VPdfActiveModal extends VPdfPluginModal {
  ownerId: string
}

export interface VPdfPluginEvents {
  onDocumentLoad?: (payload: { pageCount: number }) => void
  onDocumentClose?: () => void
  onPageChange?: (payload: VPdfPageChangeEvent) => void
  onScaleChange?: (payload: VPdfScaleChangeEvent) => void
  onPassword?: (payload: VPdfPasswordRequest) => void
  onProgress?: (payload: VPdfProgressEvent) => void
  onError?: (payload: VPdfErrorEvent) => void
  onAnnotationChange?: (payload: VPdfAnnotationChangeEvent) => void
  onAttachmentDownload?: (payload: VPdfAttachmentDownloadEvent) => void
  onReady?: () => void
  onPrepareDocumentInit?: (payload: VPdfPrepareDocumentInitEvent) => void
}

export interface VPdfPluginContext {
  readonly id: string
  readonly state: Readonly<Ref<VPdfViewerState>>
  readonly options: Readonly<Ref<VPdfViewerOptions>>
  readonly controller: VPdfViewerController
  /** Viewer host element after mount; undefined until `mount()` completes. */
  readonly viewerHost: Readonly<Ref<HTMLElement | undefined>>
  readonly signal: AbortSignal
  getDocument(): import('pdfjs-dist').PDFDocumentProxy | undefined
  getPage(pageNumber: number): Promise<import('pdfjs-dist').PDFPageProxy | undefined>
  getPageGeometry(pageNumber: number): VPdfPageGeometry | undefined
  registerToolbarItem(item: VPdfPluginToolbarItem): VPdfPluginDisposer
  registerPanel(panel: VPdfPluginPanel): VPdfPluginDisposer
  registerMenuItem(item: VPdfPluginMenuItem): VPdfPluginDisposer
  registerShortcut(shortcut: VPdfPluginShortcut): VPdfPluginDisposer
  registerControl(control: VPdfPluginControl): VPdfPluginDisposer
  registerPageOverlay(overlay: VPdfPluginPageOverlay): VPdfPluginDisposer
  registerIconRenderer(renderer: VPdfIconRenderer): VPdfPluginDisposer
  registerUiComponent(slot: VPdfUiSlot, component: Component): VPdfPluginDisposer
  registerXfaThumbnailRasterizer(rasterizer: VPdfXfaThumbnailRasterizer): VPdfPluginDisposer
  /** Last registered XFA thumbnail rasterizer, if any. */
  readonly xfaThumbnailRasterizer: Readonly<Ref<VPdfXfaThumbnailRasterizer | undefined>>
  openModal(modal: VPdfPluginModal): void
  closeModal(): void
  on<K extends keyof VPdfPluginEvents>(
    event: K,
    handler: NonNullable<VPdfPluginEvents[K]>,
  ): VPdfPluginDisposer
  emit<K extends keyof VPdfPluginEvents>(
    event: K,
    ...args: Parameters<NonNullable<VPdfPluginEvents[K]>>
  ): void
  getPluginState<T>(): T | undefined
  setPluginState<T>(value: T): void
}

export interface VPdfPluginDefinition<TOptions = any, TState = any> {
  id: string
  name?: string
  version?: string
  /** Default true. Can be toggled via viewer plugins config. */
  enabled?: boolean
  options?: TOptions
  createState?: (options: TOptions | undefined) => TState
  setup: (
    ctx: VPdfPluginContext,
    options: TOptions | undefined,
  ) => void | VPdfPluginDisposer | Promise<void | VPdfPluginDisposer>
}

export interface VpdfAnnotationsPluginOptions {
  editorComponent?: Component
}

export interface VPdfPluginsConfig {
  plugins?: Array<VPdfPluginDefinition<any, any>>
  /** Map of plugin id → enabled override */
  enabled?: Record<string, boolean>
}
