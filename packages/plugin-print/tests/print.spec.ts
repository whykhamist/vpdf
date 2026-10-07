import { describe, expect, it, vi } from 'vitest'
import { printPdfDocument, type VPdfPrintDocument, type VPdfPrintPage } from '../src/printDocument'

function createCanvas() {
  return {
    width: 0,
    height: 0,
    getContext: () => ({}) as CanvasRenderingContext2D,
    toDataURL: () => 'data:image/png;base64,abc',
  } as unknown as HTMLCanvasElement
}

function createPrintWindow() {
  const body = document.createElement('div')
  const head = document.createElement('head')
  return {
    document: {
      open: vi.fn(),
      write: vi.fn(),
      close: vi.fn(),
      createElement: (tag: string) => document.createElement(tag),
      importNode: (node: Node, deep?: boolean) => document.importNode(node, deep ?? false),
      head,
      body,
    },
    focus: vi.fn(),
    print: vi.fn(),
    close: vi.fn(),
  }
}

function createDocument(pages: number, renderImpl?: VPdfPrintPage['render']): VPdfPrintDocument {
  const render =
    renderImpl ??
    vi.fn(() => ({
      promise: Promise.resolve(),
      cancel: vi.fn(),
    }))
  return {
    numPages: pages,
    getPage: vi.fn(async () => ({
      getViewport: () => ({ width: 8, height: 12 }),
      render,
    })),
  }
}

describe('printPdfDocument', () => {
  it('reports progress while rendering pages', async () => {
    const onProgress = vi.fn()
    const printWindow = createPrintWindow()
    const pdf = createDocument(3)
    await printPdfDocument(pdf, {
      openWindow: () => printWindow as unknown as Window,
      createCanvas,
      onProgress,
    })
    expect(onProgress).toHaveBeenCalledWith({ page: 0, total: 3 })
    expect(onProgress).toHaveBeenCalledWith({ page: 1, total: 3 })
    expect(onProgress).toHaveBeenCalledWith({ page: 2, total: 3 })
    expect(onProgress).toHaveBeenCalledWith({ page: 3, total: 3 })
  })

  it('renders every page with print intent, then prints', async () => {
    const printWindow = createPrintWindow()
    const pdf = createDocument(2)
    await printPdfDocument(pdf, {
      dpi: 72,
      title: 'Report',
      openWindow: () => printWindow as unknown as Window,
      createCanvas,
    })
    expect(pdf.getPage).toHaveBeenCalledTimes(2)
    const page = await pdf.getPage(1)
    expect(page.render).toHaveBeenCalledWith(
      expect.objectContaining({
        intent: 'print',
        annotationMode: 3,
      }),
    )
    expect(printWindow.document.body.querySelectorAll('img')).toHaveLength(2)
    expect(printWindow.print).toHaveBeenCalledTimes(1)
  })

  it('throws when the print popup is blocked', async () => {
    await expect(
      printPdfDocument(createDocument(1), {
        openWindow: () => null,
        createCanvas,
      }),
    ).rejects.toThrow(/popup was blocked/)
  })

  it('cancels in-flight rendering when aborted', async () => {
    const abort = new AbortController()
    const cancel = vi.fn()
    const pdf = createDocument(1, () => {
      abort.abort()
      return {
        promise: new Promise(() => undefined),
        cancel,
      }
    })
    const printWindow = createPrintWindow()
    await expect(
      printPdfDocument(pdf, {
        signal: abort.signal,
        openWindow: () => printWindow as unknown as Window,
        createCanvas,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(cancel).toHaveBeenCalled()
    expect(printWindow.close).toHaveBeenCalled()
    expect(printWindow.print).not.toHaveBeenCalled()
  })

  it('closes the print window when a page fails to render', async () => {
    const printWindow = createPrintWindow()
    const pdf: VPdfPrintDocument = {
      numPages: 1,
      getPage: vi.fn(async () => {
        throw new Error('page missing')
      }),
    }
    await expect(
      printPdfDocument(pdf, {
        openWindow: () => printWindow as unknown as Window,
        createCanvas,
      }),
    ).rejects.toThrow('page missing')
    expect(printWindow.close).toHaveBeenCalled()
    expect(printWindow.print).not.toHaveBeenCalled()
  })

  it('renders XFA pages as HTML instead of blank canvas images', async () => {
    const printWindow = createPrintWindow()
    const xfaHtml = {
      name: 'div',
      attributes: { style: { width: '612px', height: '792px' } },
      children: [{ name: '#text', value: 'XFA form content' }],
    }
    const loadXfaLayer = vi.fn(async () => ({
      getPageViewport: () => ({
        width: 100,
        height: 120,
        clone: () => ({ width: 100, height: 120, clone: () => ({ width: 100, height: 120 }) }),
      }),
      render: ({ div }: { div: HTMLDivElement }) => {
        div.textContent = 'XFA form content'
      },
    }))
    const pdf: VPdfPrintDocument = {
      numPages: 1,
      getPage: vi.fn(async () => ({
        getViewport: () => ({ width: 100, height: 120 }),
        render: vi.fn(() => ({ promise: Promise.resolve(), cancel: vi.fn() })),
        getXfa: vi.fn(async () => xfaHtml),
      })),
    }

    await printPdfDocument(pdf, {
      openWindow: () => printWindow as unknown as Window,
      createCanvas,
      loadXfaLayer,
    })

    expect(loadXfaLayer).toHaveBeenCalledTimes(1)
    expect(printWindow.document.body.querySelectorAll('img')).toHaveLength(0)
    expect(printWindow.document.body.querySelectorAll('.vpdf-print-page')).toHaveLength(1)
    expect(printWindow.document.body.textContent).toContain('XFA form content')
    expect(printWindow.print).toHaveBeenCalledTimes(1)
  })
})
