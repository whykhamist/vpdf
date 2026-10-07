import { describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { mount } from '@vue/test-utils'
import VPdfToolbar from '../../vpdf/src/components/VPdfToolbar.vue'
import { PluginManager } from '../../vpdf/src/plugins/manager'
import { createInitialViewerState, DEFAULT_FEATURES, DEFAULT_TOOLBAR } from '../../vpdf/src/utils/defaults'
import type { VPdfViewerApi } from '../../vpdf/src/composables/useVPdfViewer'
import type { VPdfViewerController, VPdfViewerOptions } from '../../vpdf/src/types'
import { createOpenPlugin, VPDF_OPEN_PLUGIN_ID } from '../src/index'

function createMockController(): VPdfViewerController {
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
    getExperimentalViewer: vi.fn(),
  }
}

function createApi(
  manager: PluginManager,
  state: ReturnType<typeof ref>,
  controller: VPdfViewerController,
) {
  return {
    resolvedToolbar: computed(() => ({ ...DEFAULT_TOOLBAR })),
    resolvedFeatures: computed(() => ({ ...DEFAULT_FEATURES })),
    state,
    controller,
    plugins: {
      toolbarItemsView: manager.toolbarItemsView,
      menuItemsView: manager.menuItemsView,
    },
  } as unknown as VPdfViewerApi
}

describe('createOpenPlugin', () => {
  it('shows the Open button when the plugin is registered', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller)
    manager.register(createOpenPlugin())

    await vi.waitFor(() => {
      expect(manager.toolbarItemsView.value.some((item) => item.kind === 'control')).toBe(true)
    })

    const wrapper = mount(VPdfToolbar, {
      props: { api: createApi(manager, state, controller) },
    })
    expect(wrapper.find('[aria-label="Open PDF"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('loads the picked file through the viewer controller', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller)
    manager.register(createOpenPlugin())

    await vi.waitFor(() => {
      expect(manager.toolbarItemsView.value.some((item) => item.kind === 'control')).toBe(true)
    })

    const wrapper = mount(VPdfToolbar, {
      props: { api: createApi(manager, state, controller) },
    })

    const file = new File(['%PDF'], 'report.pdf', { type: 'application/pdf' })
    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [file],
    })
    await input.trigger('change')

    expect(controller.load).toHaveBeenCalledWith(file)
    wrapper.unmount()
  })

  it('unregisters the Open button when the plugin is disabled', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller)
    manager.register(createOpenPlugin())

    await vi.waitFor(() => expect(manager.list().some((plugin) => plugin.id === VPDF_OPEN_PLUGIN_ID)).toBe(true))
    manager.setEnabled(VPDF_OPEN_PLUGIN_ID, false)
    expect(manager.toolbarItemsView.value).toEqual([])
  })
})
