import {
  computed,
  readonly,
  ref,
  shallowRef,
  watch,
  type Ref,
} from 'vue'
import { PdfEngine } from '../engine/PdfEngine'
import { PluginManager } from '../plugins/manager'
import { createBuiltinPlugins } from '../plugins/builtins'
import type { VPdfPluginsConfig } from '../plugins/types'
import type {
  VPdfAnnotationEditorMode,
  VPdfAnnotationEditorParams,
  VPdfFindOptions,
  VPdfSidebarPanel,
  VPdfSource,
  VPdfViewerController,
  VPdfViewerOptions,
  VPdfViewerState,
} from '../types'
import {
  createInitialViewerState,
  DEFAULT_FEATURES,
  DEFAULT_TOOLBAR,
  resolveInitialSidebar,
} from '../utils/defaults'
import { createInitialAnnotationEditorUi } from '../utils/annotationEditor'
import { mergeViewerPlugins } from '../plugins/resolve'

export interface UseVPdfViewerParams {
  options: Ref<VPdfViewerOptions>
  plugins?: VPdfPluginsConfig
}

export function useVPdfViewer(params: UseVPdfViewerParams) {
  const options = params.options
  const state = ref<VPdfViewerState>(
    createInitialViewerState(resolveInitialSidebar(options.value.sidebar)),
  )

  const engine = shallowRef<PdfEngine>()
  const containerRef = ref<HTMLElement>()
  let mountPromise: Promise<void> | undefined

  const controller: VPdfViewerController = {
    async load(source, password, documentInit) {
      await ensureMounted()
      await engine.value?.load(source, password, documentInit)
    },
    async close() {
      await engine.value?.closeDocument()
      state.value.loadState = 'idle'
      state.value.pageCount = 0
      state.value.pageNumber = 1
      state.value.scale = 1
      state.value.scalePreset = undefined
      state.value.meta = undefined
      state.value.error = undefined
      state.value.password = undefined
      state.value.annotationEditor = createInitialAnnotationEditorUi()
    },
    goToPage(pageNumber) {
      engine.value?.goToPage(pageNumber)
    },
    nextPage() {
      engine.value?.nextPage()
    },
    previousPage() {
      engine.value?.previousPage()
    },
    async goToDestination(dest) {
      await engine.value?.goToDestination(dest)
    },
    setScale(scale) {
      engine.value?.setScale(scale)
    },
    zoomIn(step) {
      engine.value?.zoomIn(step)
    },
    zoomOut(step) {
      engine.value?.zoomOut(step)
    },
    rotate(delta) {
      engine.value?.rotate(delta)
    },
    setSidebar(panel: VPdfSidebarPanel) {
      state.value.sidebar = panel
    },
    setAnnotationEditorMode(mode: VPdfAnnotationEditorMode) {
      state.value.annotationEditorMode = mode
      engine.value?.setAnnotationEditorMode(mode)
    },
    updateAnnotationEditor(patch: VPdfAnnotationEditorParams) {
      engine.value?.updateAnnotationEditor(patch)
    },
    deleteSelectedAnnotation() {
      engine.value?.deleteSelectedAnnotation()
    },
    find(findOptions: VPdfFindOptions) {
      state.value.search = {
        ...state.value.search,
        query: findOptions.query,
        caseSensitive: findOptions.caseSensitive ?? false,
        entireWord: findOptions.entireWord ?? false,
        highlightAll: findOptions.highlightAll ?? true,
        matchDiacritics: findOptions.matchDiacritics ?? false,
        findPrevious: findOptions.findPrevious ?? false,
      }
      engine.value?.find(findOptions)
    },
    findNext() {
      engine.value?.findNext()
    },
    findPrevious() {
      engine.value?.findPrevious()
    },
    clearFind() {
      engine.value?.clearFind()
      state.value.search.query = ''
    },
    async downloadOriginal(filename) {
      await engine.value?.downloadOriginal(filename)
    },
    async saveModified(filename) {
      return (await engine.value?.saveModified(filename)) ?? new Uint8Array()
    },
    getDocument() {
      return engine.value?.getDocument()
    },
    async getPage(pageNumber) {
      return engine.value?.getPage(pageNumber)
    },
    getPageGeometry(pageNumber) {
      return engine.value?.getPageGeometry(pageNumber)
    },
    getState() {
      return state.value as Readonly<VPdfViewerState>
    },
    getExperimentalViewer() {
      return engine.value?.getExperimentalViewer()
    },
  }

  const plugins = new PluginManager(
    state,
    options,
    controller,
    {
      plugins: mergeViewerPlugins(createBuiltinPlugins(), params.plugins?.plugins),
      enabled: params.plugins?.enabled,
    },
    containerRef,
  )

  async function ensureMounted(): Promise<void> {
    if (engine.value) return
    if (!mountPromise) {
      mountPromise = (async () => {
        if (!containerRef.value) {
          throw new Error('[vpdf] viewer container is not mounted')
        }
        const instance = new PdfEngine(() => options.value, {
          onLoadState: (loadState) => {
            state.value.loadState = loadState
            if (loadState !== 'password') {
              state.value.password = undefined
            }
            if (loadState === 'ready') {
              plugins.emit('onDocumentLoad', { pageCount: state.value.pageCount })
            }
          },
          onProgress: (progress) => {
            state.value.progress = progress
            plugins.emit('onProgress', progress)
          },
          onPassword: (request) => {
            state.value.password = request
            plugins.emit('onPassword', request)
          },
          onError: (error) => {
            state.value.error = error
            plugins.emit('onError', error)
          },
          onDocumentMeta: (meta) => {
            state.value.meta = meta
            state.value.pageCount = meta.pageCount
          },
          onOutline: (outline) => {
            state.value.outline = outline
          },
          onAttachments: (attachments) => {
            state.value.attachments = attachments
          },
          onPageChange: (pageNumber, pageCount) => {
            state.value.pageNumber = pageNumber
            state.value.pageCount = pageCount
            plugins.emit('onPageChange', { pageNumber, pageCount })
          },
          onScaleChange: (scale, preset) => {
            state.value.scale = scale
            state.value.scalePreset = preset
            plugins.emit('onScaleChange', { scale, preset })
          },
          onRotationChange: (rotation) => {
            state.value.rotation = rotation
          },
          onAnnotationChange: (event) => {
            if (event.editorMode) state.value.annotationEditorMode = event.editorMode
            plugins.emit('onAnnotationChange', event)
          },
          onAnnotationEditorUi: (ui) => {
            state.value.annotationEditor = ui
          },
          onSearchUpdate: (patch) => {
            state.value.search = { ...state.value.search, ...patch }
          },
          onModifications: (dirty) => {
            state.value.hasModifications = dirty
          },
          onReady: () => {
            plugins.emit('onReady')
          },
          onDocumentClose: () => {
            plugins.emit('onDocumentClose')
          },
          onPrepareDocumentInit: (payload) => {
            plugins.prepareDocumentInit(payload)
          },
        })
        await instance.mount(containerRef.value)
        engine.value = instance
      })()
    }
    await mountPromise
  }

  async function mount(el: HTMLElement): Promise<void> {
    containerRef.value = el
    await ensureMounted()
  }

  async function destroy(): Promise<void> {
    plugins.dispose()
    await engine.value?.destroy()
    engine.value = undefined
    mountPromise = undefined
  }

  watch(
    () => options.value.src,
    (src) => {
      if (!src) return
      void controller.load(src, options.value.password)
    },
  )

  const resolvedToolbar = computed(() => {
    if (options.value.toolbar === false) return false
    return { ...DEFAULT_TOOLBAR, ...options.value.toolbar }
  })

  const resolvedFeatures = computed(() => ({
    ...DEFAULT_FEATURES,
    ...options.value.features,
  }))

  return {
    state: readonly(state) as Readonly<Ref<VPdfViewerState>>,
    mutableState: state,
    options,
    controller,
    plugins,
    containerRef,
    resolvedToolbar,
    resolvedFeatures,
    mount,
    destroy,
    ensureMounted,
  }
}

export type VPdfViewerApi = ReturnType<typeof useVPdfViewer>