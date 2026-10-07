import { describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { mount } from '@vue/test-utils'
import VPdfToolbar from '../../src/components/VPdfToolbar.vue'
import { PluginManager } from '../../src/plugins/manager'
import { createZoomPlugin } from '../../src/plugins/builtins'
import { createInitialViewerState, DEFAULT_FEATURES, DEFAULT_TOOLBAR } from '../../src/utils/defaults'
import type { VPdfViewerApi } from '../../src/composables/useVPdfViewer'
import type { VPdfViewerController, VPdfViewerOptions } from '../../src/types'

function createToolbarApi(overrides?: {
  scale?: number
  scalePreset?: string
  pageCount?: number
}) {
  const state = ref({
    ...createInitialViewerState(),
    pageCount: overrides?.pageCount ?? 8,
    pageNumber: 1,
    scale: overrides?.scale ?? 1,
    scalePreset: overrides?.scalePreset,
  })
  const options = ref<VPdfViewerOptions>({})
  const controller = {
    setScale: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    previousPage: vi.fn(),
    nextPage: vi.fn(),
    goToPage: vi.fn(),
    setSidebar: vi.fn(),
    setAnnotationEditorMode: vi.fn(),
    updateAnnotationEditor: vi.fn(),
    deleteSelectedAnnotation: vi.fn(),
    saveModified: vi.fn(),
    downloadOriginal: vi.fn(),
    load: vi.fn(),
    close: vi.fn(),
    goToDestination: vi.fn(),
    rotate: vi.fn(),
    find: vi.fn(),
    findNext: vi.fn(),
    findPrevious: vi.fn(),
    clearFind: vi.fn(),
    getDocument: vi.fn(),
    getPage: vi.fn(),
    getPageGeometry: vi.fn(),
    getState: vi.fn(),
    getExperimentalViewer: vi.fn(),
  } as unknown as VPdfViewerController

  const plugins = new PluginManager(state, options, controller)
  plugins.register(createZoomPlugin())

  const api = {
    resolvedToolbar: computed(() => ({ ...DEFAULT_TOOLBAR })),
    resolvedFeatures: computed(() => ({ ...DEFAULT_FEATURES })),
    state,
    controller,
    plugins,
  } as unknown as VPdfViewerApi

  return { api, controller, state }
}

describe('VPdfToolbar scale select', () => {
  it('lists fit modes and percent presets', async () => {
    const { api } = createToolbarApi()
    const wrapper = mount(VPdfToolbar, { props: { api } })
    await vi.waitFor(() => expect(wrapper.find('select[aria-label="Zoom"]').exists()).toBe(true))
    const values = wrapper.findAll('select[aria-label="Zoom"] option').map((option) => (option.element as HTMLOptionElement).value)
    expect(values).toEqual([
      'page-fit',
      'page-width',
      'page-height',
      '0.25',
      '0.5',
      '0.75',
      '1',
      '1.25',
      '1.5',
      '2',
      '3',
      '4',
      '8',
    ])
    expect((wrapper.find('select[aria-label="Zoom"]').element as HTMLSelectElement).value).toBe('1')
  })

  it('keeps a fit preset selected after the numeric scale resolves', async () => {
    const { api } = createToolbarApi({ scale: 1.37, scalePreset: 'page-width' })
    const wrapper = mount(VPdfToolbar, { props: { api } })
    await vi.waitFor(() => expect(wrapper.find('select[aria-label="Zoom"]').exists()).toBe(true))
    expect((wrapper.find('select[aria-label="Zoom"]').element as HTMLSelectElement).value).toBe('page-width')
  })

  it('shows the current percent when zoom lands between presets', async () => {
    const { api } = createToolbarApi({ scale: 1.1 })
    const wrapper = mount(VPdfToolbar, { props: { api } })
    await vi.waitFor(() => expect(wrapper.find('select[aria-label="Zoom"]').exists()).toBe(true))
    const select = wrapper.find('select[aria-label="Zoom"]').element as HTMLSelectElement
    expect(select.value).toBe('1.1')
    expect(wrapper.find('option[value="1.1"]').text()).toBe('110%')
  })

  it('applies numeric and fit selections through setScale', async () => {
    const { api, controller } = createToolbarApi()
    const wrapper = mount(VPdfToolbar, { props: { api } })
    await vi.waitFor(() => expect(wrapper.find('select[aria-label="Zoom"]').exists()).toBe(true))
    const select = wrapper.find('select[aria-label="Zoom"]')
    await select.setValue('0.5')
    expect(controller.setScale).toHaveBeenCalledWith(0.5)
    await select.setValue('page-fit')
    expect(controller.setScale).toHaveBeenCalledWith('page-fit')
  })
})
