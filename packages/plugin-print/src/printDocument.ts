export const VPDF_PRINT_PLUGIN_ID = 'vpdf.print'

/** PDF.js AnnotationMode.ENABLE_STORAGE */
const ANNOTATION_MODE_ENABLE_STORAGE = 3

export interface VPdfPrintPluginOptions {
  /** Raster scale in dots per inch. Default 150. */
  dpi?: number
  /** Print window / document title. */
  title?: string
}

export interface VPdfPrintPage {
  getViewport(params: { scale: number }): { width: number; height: number }
  render(params: {
    canvasContext: CanvasRenderingContext2D
    viewport: { width: number; height: number }
    intent?: string
    annotationMode?: number
  }): { promise: Promise<void>; cancel?: () => void }
}

export interface VPdfPrintDocument {
  numPages: number
  getPage(pageNumber: number): Promise<VPdfPrintPage>
}

export interface PrintProgress {
  page: number
  total: number
}

export interface PrintPagesOptions {
  dpi?: number
  title?: string
  signal?: AbortSignal
  onProgress?: (progress: PrintProgress) => void
  openWindow?: () => Window | null
  createCanvas?: () => HTMLCanvasElement
  /** @internal Test hook for XfaLayer import. */
  loadXfaLayer?: () => Promise<XfaLayerApi>
}

interface XfaLayerApi {
  render(parameters: {
    viewport: { clone: (params: { dontFlip: boolean }) => unknown }
    div: HTMLDivElement
    xfaHtml: unknown
    annotationStorage?: unknown
    linkService: { addLinkAttributes: (element: HTMLElement, url: string, newWindow?: boolean) => void }
    intent?: string
  }): unknown
  getPageViewport(
    xfaPage: unknown,
    params: { scale?: number; rotation?: number },
  ): { width: number; height: number; clone: (params: { dontFlip: boolean }) => { clone: (params: { dontFlip: boolean }) => unknown } }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    const error = new DOMException('Print cancelled', 'AbortError')
    throw error
  }
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

type PdfJsPrintPage = VPdfPrintPage & {
  getXfa?: () => Promise<unknown>
}

type PdfJsPrintDocument = VPdfPrintDocument & {
  annotationStorage?: unknown
}

const printXfaLinkService = {
  addLinkAttributes() {},
}

let xfaLayerModulePromise: Promise<{ XfaLayer: XfaLayerApi }> | undefined

function loadXfaLayerModule(): Promise<{ XfaLayer: XfaLayerApi }> {
  xfaLayerModulePromise ??= import('pdfjs-dist/legacy/build/pdf.mjs') as unknown as Promise<{
    XfaLayer: XfaLayerApi
  }>
  return xfaLayerModulePromise
}

function copyPrintStyles(targetDoc: Document) {
  if (!targetDoc.head || targetDoc.head.querySelector('[data-vpdf-print-styles]')) return

  const marker = targetDoc.createElement('meta')
  marker.setAttribute('data-vpdf-print-styles', '')
  targetDoc.head.appendChild(marker)

  for (const node of document.querySelectorAll('link[rel="stylesheet"], style')) {
    targetDoc.head.appendChild(node.cloneNode(true))
  }
}

interface PrintTarget {
  window: Window
  document: Document
  close: () => void
}

function createPrintTarget(openWindow?: () => Window | null): PrintTarget {
  if (openWindow) {
    const printWindow = openWindow()
    if (!printWindow) {
      throw new Error('[vpdf] print popup was blocked')
    }
    return {
      window: printWindow,
      document: printWindow.document,
      close: () => printWindow.close(),
    }
  }

  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', 'vpdf-print')
  iframe.setAttribute(
    'style',
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden',
  )
  document.body.appendChild(iframe)
  const printWindow = iframe.contentWindow
  const doc = iframe.contentDocument
  if (!printWindow || !doc) {
    iframe.remove()
    throw new Error('[vpdf] print frame is unavailable')
  }
  return {
    window: printWindow,
    document: doc,
    close: () => iframe.remove(),
  }
}

export async function printPdfDocument(
  documentProxy: VPdfPrintDocument,
  options: PrintPagesOptions = {},
): Promise<void> {
  const dpi = options.dpi ?? 150
  const title = options.title ?? 'Document'
  const totalPages = documentProxy.numPages
  const pdfDoc = documentProxy as PdfJsPrintDocument
  const printTarget = createPrintTarget(options.openWindow)
  const printWindow = printTarget.window
  const doc = printTarget.document

  try {
    doc.open()
    doc.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(title)}</title>
    <style>
      html, body { margin: 0; background: #fff; }
      img, .vpdf-print-page { display: block; width: 100%; page-break-after: always; }
      img:last-of-type, .vpdf-print-page:last-of-type { page-break-after: auto; }
      .vpdf-print-page { position: relative; overflow: hidden; margin: 0 auto; }
      @page { margin: 0; }
    </style>
  </head>
  <body></body>
</html>`)
    doc.close()
    copyPrintStyles(doc)
  } catch (setupError) {
    printTarget.close()
    throw setupError
  }

  try {
    options.onProgress?.({ page: 0, total: totalPages })
    await yieldToMain()

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      throwIfAborted(options.signal)
      const page = await documentProxy.getPage(pageNumber)
      throwIfAborted(options.signal)
      const pdfPage = page as PdfJsPrintPage
      const xfaHtml = typeof pdfPage.getXfa === 'function' ? await pdfPage.getXfa() : null
      if (xfaHtml) {
        const pageElement = await renderXfaPrintPage(
          xfaHtml,
          dpi,
          doc,
          pdfDoc.annotationStorage,
          options,
        )
        throwIfAborted(options.signal)
        doc.body.appendChild(pageElement)
      } else {
        const dataUrl = await renderPrintPage(page, dpi, options)
        throwIfAborted(options.signal)
        const img = doc.createElement('img')
        img.alt = `Page ${pageNumber}`
        img.src = dataUrl
        doc.body.appendChild(img)
        await img.decode?.()
      }
      options.onProgress?.({ page: pageNumber, total: totalPages })
      await yieldToMain()
    }
    printWindow.focus()
    printWindow.print()
  } catch (error) {
    printTarget.close()
    throw error
  }
}

async function renderPrintPage(
  page: VPdfPrintPage,
  dpi: number,
  options: PrintPagesOptions,
): Promise<string> {
  const scale = dpi / 72
  const viewport = page.getViewport({ scale })
  const canvas = options.createCanvas?.() ?? document.createElement('canvas')
  canvas.width = Math.max(1, Math.ceil(viewport.width))
  canvas.height = Math.max(1, Math.ceil(viewport.height))
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('[vpdf] print canvas context is unavailable')
  }

  const task = page.render({
    canvasContext: context,
    viewport,
    intent: 'print',
    annotationMode: ANNOTATION_MODE_ENABLE_STORAGE,
  })

  if (options.signal?.aborted) {
    task.cancel?.()
    throwIfAborted(options.signal)
  }

  const onAbort = () => task.cancel?.()
  options.signal?.addEventListener('abort', onAbort, { once: true })
  try {
    await task.promise
  } finally {
    options.signal?.removeEventListener('abort', onAbort)
  }

  return canvas.toDataURL('image/png')
}

async function renderXfaPrintPage(
  xfaHtml: unknown,
  dpi: number,
  targetDoc: Document,
  annotationStorage: unknown,
  options: PrintPagesOptions,
): Promise<HTMLElement> {
  const loadXfaLayer = options.loadXfaLayer ?? (async () => (await loadXfaLayerModule()).XfaLayer)
  const XfaLayer = await loadXfaLayer()
  const scale = dpi / 72
  const viewport = XfaLayer.getPageViewport(xfaHtml, { scale })
  const staging = document.createElement('div')
  staging.style.position = 'fixed'
  staging.style.left = '-10000px'
  staging.style.top = '0'
  staging.style.width = `${viewport.width}px`
  staging.style.height = `${viewport.height}px`
  staging.style.overflow = 'hidden'
  document.body.appendChild(staging)

  try {
    const xfaHost = document.createElement('div')
    staging.appendChild(xfaHost)
    XfaLayer.render({
      xfaHtml,
      div: xfaHost,
      viewport: viewport.clone({ dontFlip: true }),
      annotationStorage: annotationStorage ?? undefined,
      linkService: printXfaLinkService,
      intent: 'print',
    })

    const pageShell = targetDoc.createElement('div')
    pageShell.className = 'vpdf-print-page'
    pageShell.style.width = `${viewport.width}px`
    pageShell.style.height = `${viewport.height}px`
    pageShell.appendChild(targetDoc.importNode(xfaHost, true))
    return pageShell
  } finally {
    staging.remove()
  }
}
