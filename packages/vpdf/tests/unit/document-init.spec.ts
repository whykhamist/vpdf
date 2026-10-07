import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { PluginManager } from '../../src/plugins/manager'
import { createInitialViewerState } from '../../src/utils/defaults'
import { buildDocumentInitParameters } from '../../src/utils/documentInit'
import { normalizeSource } from '../../src/utils/source'
import type {
  VPdfPrepareDocumentInitEvent,
  VPdfViewerController,
  VPdfViewerOptions,
} from '../../src/types'

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

const assets = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/fonts/',
  wasmUrl: '/wasm/',
}

describe('buildDocumentInitParameters', () => {
  it('merges viewer and per-load httpHeaders and withCredentials', () => {
    const source = 'https://files.example.com/a.pdf'
    const params = buildDocumentInitParameters({
      assets,
      features: { scripting: false, xfa: true },
      normalized: normalizeSource(source),
      source,
      viewer: {
        withCredentials: true,
        httpHeaders: { 'X-App': 'vpdf', Authorization: 'Bearer old' },
      },
      perLoad: {
        disableRange: true,
        httpHeaders: { Authorization: 'Bearer new' },
      },
    })

    expect(params.url).toBe(source)
    expect(params.withCredentials).toBe(true)
    expect(params.disableRange).toBe(true)
    expect(params.httpHeaders).toEqual({
      'X-App': 'vpdf',
      Authorization: 'Bearer new',
    })
    expect(params.isEvalSupported).toBe(false)
    expect(params.enableScripting).toBe(false)
  })

  it('restores reserved url/password and security flags after plugin mutation', () => {
    const source = 'https://files.example.com/a.pdf'
    const params = buildDocumentInitParameters({
      assets,
      features: { scripting: false, xfa: true },
      normalized: normalizeSource(source),
      source,
      password: 'secret',
      prepare: ({ params: draft }) => {
        draft.url = 'https://evil.example/x.pdf'
        draft.data = new Uint8Array([1])
        draft.password = 'hacked'
        draft.isEvalSupported = true
        draft.enableScripting = true
        draft.httpHeaders = { Authorization: 'Bearer plugin' }
      },
    })

    expect(params.url).toBe(source)
    expect(params.data).toBeUndefined()
    expect(params.password).toBe('secret')
    expect(params.isEvalSupported).toBe(false)
    expect(params.enableScripting).toBe(false)
    expect(params.httpHeaders).toEqual({ Authorization: 'Bearer plugin' })
  })

  it('keeps binary data sources on data, not url', () => {
    const source = new Uint8Array([37, 80, 68, 70])
    const params = buildDocumentInitParameters({
      assets,
      features: {},
      normalized: normalizeSource(source),
      source,
    })

    expect(params.url).toBeUndefined()
    expect(params.data).toBeInstanceOf(Uint8Array)
  })
})

describe('PluginManager.prepareDocumentInit', () => {
  it('invokes registered handlers on the shared params object', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller)

    manager.register({
      id: 'auth',
      setup(ctx) {
        ctx.on('onPrepareDocumentInit', ({ params }) => {
          params.httpHeaders = {
            ...(params.httpHeaders as Record<string, string> | undefined),
            Authorization: 'Bearer plugin',
          }
        })
      },
    })

    await vi.waitFor(() => expect(manager.list()[0]?.active).toBe(true))

    const payload: VPdfPrepareDocumentInitEvent = {
      params: { url: 'https://files.example.com/a.pdf', httpHeaders: { 'X-App': 'vpdf' } },
      context: { source: 'https://files.example.com/a.pdf' },
    }
    manager.prepareDocumentInit(payload)

    expect(payload.params.httpHeaders).toEqual({
      'X-App': 'vpdf',
      Authorization: 'Bearer plugin',
    })

    manager.dispose()
  })
})
