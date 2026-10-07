import { describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import VPdfToolbar from '../../vpdf/src/components/VPdfToolbar.vue'
import { PluginManager } from '../../vpdf/src/plugins/manager'
import { createInitialViewerState, DEFAULT_FEATURES, DEFAULT_TOOLBAR } from '../../vpdf/src/utils/defaults'
import type { VPdfViewerApi } from '../../vpdf/src/composables/useVPdfViewer'
import type { VPdfViewerController, VPdfViewerOptions } from '../../vpdf/src/types'
import {
  createPageLayoutPlugin,
  mapPageLayoutMode,
  PDFJS_SCROLL_MODE,
  PDFJS_SPREAD_MODE,
} from '../src/index'

function createMockViewer() {
  return {
    scrollMode: PDFJS_SCROLL_MODE.VERTICAL,
    spreadMode: PDFJS_SPREAD_MODE.NONE,
  }
}

function createMockController(viewer: ReturnType<typeof createMockViewer>): VPdfViewerController {
  return {
    load: vi.fn(),
    close: vi.fn(),
    goToPage: vi.fn(),
    nextPage: vi.fn(),
    previousPage: vi.fn(),
    goToDestination: vi.fn(),
    setScale: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    rotate: vi.fn(),
    setSidebar: vi.fn(),
    setAnnotationEditorMode: vi.fn(),
    updateAnnotationEditor: vi.fn(),
    deleteSelectedAnnotation: vi.fn(),
    find: vi.fn(),
    findNext: vi.fn(),
    findPrevious: vi.fn(),
    clearFind: vi.fn(),
    downloadOriginal: vi.fn(),
    saveModified: vi.fn(),
    getDocument: vi.fn(),
    getPage: vi.fn(),
    getPageGeometry: vi.fn(),
    getState: vi.fn(),
    getExperimentalViewer: vi.fn(() => viewer),
  }
}

describe('mapPageLayoutMode', () => {
  it('maps consecutive two-column pairs onto odd spreads', () => {
    expect(mapPageLayoutMode('two-column')).toEqual({
      scrollMode: PDFJS_SCROLL_MODE.VERTICAL,
      spreadMode: PDFJS_SPREAD_MODE.ODD,
    })
  })

  it('maps single-page onto PDF.js page scroll', () => {
    expect(mapPageLayoutMode('single-page')).toEqual({
      scrollMode: PDFJS_SCROLL_MODE.PAGE,
      spreadMode: PDFJS_SPREAD_MODE.NONE,
    })
  })
})

describe('createPageLayoutPlugin', () => {
  it('renders a toolbar dropdown, applies PDF.js modes, reapplies on ready, and restores on disable', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const viewer = createMockViewer()
    const controller = createMockController(viewer)
    const manager = new PluginManager(state, options, controller)
    manager.register(createPageLayoutPlugin())

    await vi.waitFor(() => {
      expect(manager.toolbarItemsView.value.some((item) => item.kind === 'control')).toBe(true)
    })

    const api = {
      resolvedToolbar: computed(() => ({ ...DEFAULT_TOOLBAR })),
      resolvedFeatures: computed(() => ({ ...DEFAULT_FEATURES })),
      state,
      controller,
      plugins: {
        toolbarItemsView: manager.toolbarItemsView,
        menuItemsView: manager.menuItemsView,
      },
    } as unknown as VPdfViewerApi

    const wrapper = mount(VPdfToolbar, {
      props: { api },
    })

    const layoutSelect = () => wrapper.find('select[aria-label="Page layout"]')
    expect(layoutSelect().exists()).toBe(true)
    expect(layoutSelect().attributes('disabled')).toBeDefined()

    manager.emit('onReady')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(layoutSelect().attributes('disabled')).toBeUndefined()
    expect(viewer.scrollMode).toBe(PDFJS_SCROLL_MODE.VERTICAL)
    expect(viewer.spreadMode).toBe(PDFJS_SPREAD_MODE.NONE)

    await layoutSelect().setValue('horizontal')
    expect(viewer.scrollMode).toBe(PDFJS_SCROLL_MODE.HORIZONTAL)
    expect(viewer.spreadMode).toBe(PDFJS_SPREAD_MODE.NONE)

    await layoutSelect().setValue('two-column')
    expect(viewer.scrollMode).toBe(PDFJS_SCROLL_MODE.VERTICAL)
    expect(viewer.spreadMode).toBe(PDFJS_SPREAD_MODE.ODD)

    await layoutSelect().setValue('wrapped')
    expect(viewer.scrollMode).toBe(PDFJS_SCROLL_MODE.WRAPPED)
    expect(viewer.spreadMode).toBe(PDFJS_SPREAD_MODE.NONE)

    await layoutSelect().setValue('single-page')
    expect(viewer.scrollMode).toBe(PDFJS_SCROLL_MODE.PAGE)
    expect(viewer.spreadMode).toBe(PDFJS_SPREAD_MODE.NONE)

    viewer.scrollMode = PDFJS_SCROLL_MODE.VERTICAL
    viewer.spreadMode = PDFJS_SPREAD_MODE.NONE
    manager.emit('onReady')
    expect(viewer.scrollMode).toBe(PDFJS_SCROLL_MODE.PAGE)
    expect(viewer.spreadMode).toBe(PDFJS_SPREAD_MODE.NONE)

    manager.setEnabled('page-layout', false)
    expect(viewer.scrollMode).toBe(PDFJS_SCROLL_MODE.VERTICAL)
    expect(viewer.spreadMode).toBe(PDFJS_SPREAD_MODE.NONE)
    await wrapper.vm.$nextTick()
    expect(layoutSelect().exists()).toBe(false)
  })
})
