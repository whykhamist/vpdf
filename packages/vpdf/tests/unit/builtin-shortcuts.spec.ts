import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { PluginManager } from '../../src/plugins/manager'
import {
  createNavigationPlugin,
  createZoomPlugin,
  VPDF_BUILTIN_PLUGIN_IDS,
} from '../../src/plugins/builtins'
import { createInitialViewerState } from '../../src/utils/defaults'
import type { VPdfViewerController, VPdfViewerOptions } from '../../src/types'
import VPdfViewer from '../../src/components/VPdfViewer.vue'

vi.mock('../../src/engine/PdfEngine', () => ({
  PdfEngine: class {
    async mount() {}
    async destroy() {}
    async load() {}
    async closeDocument() {}
    zoomIn() {}
    zoomOut() {}
    setScale() {}
    goToPage() {}
  },
}))

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

async function createManager(options: VPdfViewerOptions = {}, statePatch: Partial<ReturnType<typeof createInitialViewerState>> = {}) {
  const state = ref({ ...createInitialViewerState(), pageCount: 8, ...statePatch })
  const optionRef = ref<VPdfViewerOptions>(options)
  const controller = createMockController()
  const manager = new PluginManager(state, optionRef, controller, {
    plugins: [createNavigationPlugin(), createZoomPlugin()],
  })
  await vi.waitFor(() => expect(manager.shortcutsView.value.length).toBeGreaterThan(4))
  return { manager, controller, optionRef }
}

describe('built-in viewing shortcuts', () => {
  it('zooms with Ctrl/Cmd + +/=/− and resets with 0', async () => {
    const { manager, controller } = await createManager()

    const zoomIn = manager.matchShortcut(new KeyboardEvent('keydown', { key: '=', ctrlKey: true }))
    expect(zoomIn?.id).toContain('in-equal')
    await zoomIn?.handler(new KeyboardEvent('keydown', { key: '=', ctrlKey: true }))
    expect(controller.zoomIn).toHaveBeenCalled()

    const zoomInMeta = manager.matchShortcut(new KeyboardEvent('keydown', { key: '+', metaKey: true, shiftKey: true }))
    expect(zoomInMeta?.id).toContain('in-plus-shift-meta')
    await zoomInMeta?.handler(new KeyboardEvent('keydown', { key: '+', metaKey: true, shiftKey: true }))
    expect(controller.zoomIn).toHaveBeenCalledTimes(2)

    const zoomOut = manager.matchShortcut(new KeyboardEvent('keydown', { key: '-', ctrlKey: true }))
    await zoomOut?.handler(new KeyboardEvent('keydown', { key: '-', ctrlKey: true }))
    expect(controller.zoomOut).toHaveBeenCalled()

    const reset = manager.matchShortcut(new KeyboardEvent('keydown', { key: '0', metaKey: true }))
    await reset?.handler(new KeyboardEvent('keydown', { key: '0', metaKey: true }))
    expect(controller.setScale).toHaveBeenCalledWith(1)
  })

  it('jumps to the first and last page with Home and End', async () => {
    const { manager, controller } = await createManager()
    const home = manager.matchShortcut(new KeyboardEvent('keydown', { key: 'Home' }))
    await home?.handler(new KeyboardEvent('keydown', { key: 'Home' }))
    expect(controller.goToPage).toHaveBeenCalledWith(1)

    const end = manager.matchShortcut(new KeyboardEvent('keydown', { key: 'End' }))
    await end?.handler(new KeyboardEvent('keydown', { key: 'End' }))
    expect(controller.goToPage).toHaveBeenCalledWith(8)
  })

  it('ignores zoom and page shortcuts when the matching toolbar features are off', async () => {
    const { manager } = await createManager({ toolbar: { zoom: false, pageNav: false } })
    expect(manager.matchShortcut(new KeyboardEvent('keydown', { key: '=', ctrlKey: true }))).toBeUndefined()
    expect(manager.matchShortcut(new KeyboardEvent('keydown', { key: 'Home' }))).toBeUndefined()
  })

  it('stops matching shortcuts after the zoom plugin is disabled', async () => {
    const { manager } = await createManager()
    manager.setEnabled(VPDF_BUILTIN_PLUGIN_IDS.zoom, false)
    expect(manager.matchShortcut(new KeyboardEvent('keydown', { key: '=', ctrlKey: true }))).toBeUndefined()
    expect(manager.matchShortcut(new KeyboardEvent('keydown', { key: 'Home' }))?.id).toContain('first-page')
  })
})

describe('viewer shortcut host', () => {
  let wrapper: VueWrapper | undefined

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
  })

  it('prevents the browser default for built-in zoom shortcuts', async () => {
    wrapper = mount(VPdfViewer)
    await flushPromises()
    const event = new KeyboardEvent('keydown', { key: '=', ctrlKey: true, cancelable: true })
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })
})
