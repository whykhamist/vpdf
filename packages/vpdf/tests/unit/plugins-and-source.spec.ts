import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { PluginManager } from '../../src/plugins/manager'
import { createInitialViewerState } from '../../src/utils/defaults'
import { normalizeSource, filenameFromUrl } from '../../src/utils/source'
import type { VPdfViewerController, VPdfViewerOptions } from '../../src/types'

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

describe('normalizeSource', () => {
  it('keeps URL strings for streaming', () => {
    const result = normalizeSource('https://example.com/a.pdf')
    expect(result.data).toBe('https://example.com/a.pdf')
    expect(result.objectUrl).toBeUndefined()
    expect(result.filename).toBe('a.pdf')
  })

  it('creates object URLs for File/Blob', () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(() => 'blob:test'),
    })
    const file = new File(['%PDF'], 'report.pdf', { type: 'application/pdf' })
    const result = normalizeSource(file)
    expect(result.objectUrl).toBe('blob:test')
    expect(result.filename).toBe('report.pdf')
  })

  it('extracts filenames from URLs', () => {
    expect(filenameFromUrl('https://cdn.example/files/doc.PDF?x=1')).toBe('doc.PDF')
  })
})

describe('PluginManager', () => {
  it('registers, enables, disables, and disposes plugins', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller)

    let cleaned = false
    manager.register({
      id: 'sample',
      setup(ctx) {
        ctx.registerToolbarItem({
          id: 'action',
          label: 'Action',
          onClick: () => undefined,
        })
        ctx.registerShortcut({
          id: 'go',
          key: 'g',
          handler: () => undefined,
        })
        return () => {
          cleaned = true
        }
      },
    })

    await vi.waitFor(() => {
      expect(manager.toolbarItemsView.value.some((item) => item.id.includes('action'))).toBe(true)
    })

    expect(manager.isEnabled('sample')).toBe(true)
    manager.setEnabled('sample', false)
    expect(manager.toolbarItemsView.value.length).toBe(0)
    expect(cleaned).toBe(true)

    cleaned = false
    manager.setEnabled('sample', true)
    await vi.waitFor(() => expect(manager.list()[0]?.active).toBe(true))
    manager.dispose()
    expect(cleaned).toBe(true)
    expect(manager.list()).toEqual([])
  })

  it('matches shortcuts', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller)
    const handler = vi.fn()

    manager.register({
      id: 'keys',
      setup(ctx) {
        ctx.registerShortcut({
          id: 'save',
          key: 's',
          ctrl: true,
          handler,
        })
      },
    })

    await vi.waitFor(() => expect(manager.shortcutsView.value.length).toBe(1))
    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
    expect(manager.matchShortcut(event)?.id).toContain('save')
  })

  it('keeps toolbar placements, menu items, and selected sidebar panels', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller)

    manager.register({
      id: 'chrome',
      setup(ctx) {
        ctx.registerToolbarItem({
          id: 'start',
          label: 'Start',
          placement: 'start',
          onClick: () => undefined,
        })
        ctx.registerToolbarItem({
          id: 'hidden',
          label: 'Hidden',
          visible: () => false,
          onClick: () => undefined,
        })
        ctx.registerMenuItem({
          id: 'menu',
          label: 'Menu',
          onClick: () => undefined,
        })
        ctx.registerPanel({
          id: 'one',
          label: 'One',
          component: {},
        })
        ctx.registerPanel({
          id: 'two',
          label: 'Two',
          component: {},
        })
      },
    })

    await vi.waitFor(() => expect(manager.panelsView.value.length).toBe(2))
    expect(manager.toolbarItemsView.value.find((item) => item.id.includes('start'))?.placement).toBe('start')
    expect(manager.menuItemsView.value.some((item) => item.id.includes('menu'))).toBe(true)
    expect(manager.selectedPanelId.value).toContain('one')
    manager.selectPanel(manager.panelsView.value[1]!.id)
    expect(manager.selectedPanelId.value).toContain('two')
    manager.setEnabled('chrome', false)
    expect(manager.selectedPanelId.value).toBeUndefined()
    expect(manager.menuItemsView.value).toEqual([])
  })

  it('keeps a single owner-scoped modal and ignores foreign close', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller)
    const Panel = {}

    manager.register({
      id: 'alpha',
      setup(ctx) {
        ctx.openModal({ component: Panel })
      },
    })
    manager.register({
      id: 'beta',
      setup(ctx) {
        ctx.openModal({ component: Panel })
      },
    })

    await vi.waitFor(() => expect(manager.modalView.value?.ownerId).toBe('beta'))

    manager.register({
      id: 'closer',
      setup(ctx) {
        ctx.closeModal()
      },
    })
    expect(manager.modalView.value?.ownerId).toBe('beta')

    manager.setEnabled('alpha', false)
    expect(manager.modalView.value?.ownerId).toBe('beta')

    manager.setEnabled('beta', false)
    expect(manager.modalView.value).toBeUndefined()

    manager.register({
      id: 'gamma',
      setup(ctx) {
        ctx.openModal({ component: Panel })
      },
    })
    await vi.waitFor(() => expect(manager.modalView.value?.ownerId).toBe('gamma'))
    manager.dismissModal()
    expect(manager.modalView.value).toBeUndefined()
    manager.dispose()
    expect(manager.modalView.value).toBeUndefined()
  })

  it('keeps the last registered XFA thumbnail rasterizer and clears it on dispose', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller)
    const first = vi.fn()
    const second = vi.fn()

    manager.register({
      id: 'raster-a',
      setup(ctx) {
        ctx.registerXfaThumbnailRasterizer(first)
      },
    })
    manager.register({
      id: 'raster-b',
      setup(ctx) {
        ctx.registerXfaThumbnailRasterizer(second)
      },
    })

    await vi.waitFor(() => expect(manager.xfaThumbnailRasterizerView.value).toBe(second))
    manager.setEnabled('raster-b', false)
    expect(manager.xfaThumbnailRasterizerView.value).toBe(first)
    manager.dispose()
    expect(manager.xfaThumbnailRasterizerView.value).toBeUndefined()
  })
})
