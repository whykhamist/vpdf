import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { PluginManager } from '../../src/plugins/manager'
import { createBuiltinPlugins, VPDF_BUILTIN_PLUGIN_IDS } from '../../src/plugins/builtins'
import { createInitialViewerState } from '../../src/utils/defaults'
import { pluginItemProps } from '../../src/plugins/resolve'
import type { VPdfAttachmentDownloadEvent, VPdfViewerController, VPdfViewerOptions } from '../../src/types'

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

function panelIds(manager: PluginManager) {
  return manager.panelsView.value.map((panel) => panel.id)
}

async function downloadFromAttachments(
  manager: PluginManager,
  id = 'file-1',
  filename = 'notes.txt',
) {
  const panel = manager.panelsView.value.find((entry) => entry.id.endsWith(':attachments'))
  expect(panel).toBeTruthy()
  const props = pluginItemProps(panel!) as {
    onDownload: (id: string, filename: string) => void | Promise<void>
  }
  await props.onDownload(id, filename)
}

describe('sidebar builtin plugins', () => {
  it('registers thumbnails, outline, and attachments as separate panels', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: createBuiltinPlugins(),
    })
    await vi.waitFor(() => expect(manager.panelsView.value.length).toBe(3))
    expect(panelIds(manager)).toEqual([
      'vpdf.thumbnails:thumbnails',
      'vpdf.outline:outline',
      'vpdf.attachments:attachments',
    ])

    manager.setEnabled(VPDF_BUILTIN_PLUGIN_IDS.thumbnails, false)
    await vi.waitFor(() => expect(manager.panelsView.value.length).toBe(2))
    expect(panelIds(manager)).toEqual([
      'vpdf.outline:outline',
      'vpdf.attachments:attachments',
    ])
  })

  it('downloads attachments immediately by default', async () => {
    const getAttachmentContent = vi.fn(async () => new Uint8Array([1, 2, 3]))
    const state = ref({
      ...createInitialViewerState(),
      attachments: [{ id: 'file-1', filename: 'notes.txt', contentType: 'text/plain' }],
    })
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    controller.getDocument = vi.fn(() => ({ getAttachmentContent })) as unknown as VPdfViewerController['getDocument']
    const manager = new PluginManager(state, options, controller, {
      plugins: createBuiltinPlugins(),
    })
    await vi.waitFor(() => expect(manager.panelsView.value.length).toBe(3))

    const createObjectURL = vi.fn(() => 'blob:attachment')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, writable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, writable: true, value: revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    await downloadFromAttachments(manager)
    expect(getAttachmentContent).toHaveBeenCalledWith('file-1')
    expect(createObjectURL).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()

    click.mockRestore()
  })

  it('emits onAttachmentDownload when allowAttachmentDownload is false until confirmed', async () => {
    const getAttachmentContent = vi.fn(async () => new Uint8Array([9, 8, 7]))
    const state = ref({
      ...createInitialViewerState(),
      attachments: [{ id: 'file-1', filename: 'secret.bin' }],
    })
    const options = ref<VPdfViewerOptions>({ allowAttachmentDownload: false })
    const controller = createMockController()
    controller.getDocument = vi.fn(() => ({ getAttachmentContent })) as unknown as VPdfViewerController['getDocument']
    const manager = new PluginManager(state, options, controller, {
      plugins: createBuiltinPlugins(),
    })
    await vi.waitFor(() => expect(manager.panelsView.value.length).toBe(3))

    const pending: VPdfAttachmentDownloadEvent[] = []
    manager.on('onAttachmentDownload', (payload) => {
      pending.push(payload)
    })

    await downloadFromAttachments(manager, 'file-1', 'secret.bin')
    expect(getAttachmentContent).not.toHaveBeenCalled()
    expect(pending).toHaveLength(1)
    expect(pending[0]?.attachment).toMatchObject({ id: 'file-1', filename: 'secret.bin' })

    const createObjectURL = vi.fn(() => 'blob:attachment')
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, writable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, writable: true, value: vi.fn() })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    await pending[0]!.download()
    expect(getAttachmentContent).toHaveBeenCalledWith('file-1')
    expect(createObjectURL).toHaveBeenCalled()

    click.mockRestore()
  })
})
