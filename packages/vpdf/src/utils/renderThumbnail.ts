export const THUMBNAIL_CSS_WIDTH = 88
export const THUMBNAIL_MAX_PIXEL_RATIO = 2

export type ThumbnailViewport = {
  width: number
  height: number
}

export type ThumbnailRenderTask = {
  promise: Promise<unknown>
  cancel: () => void
}

export type ThumbnailPage = {
  getViewport: (params: { scale: number; rotation?: number }) => ThumbnailViewport
  render: (params: {
    canvasContext: CanvasRenderingContext2D
    canvas: HTMLCanvasElement
    viewport: ThumbnailViewport
  }) => ThumbnailRenderTask
  getXfa?: () => Promise<unknown>
}

export type VPdfXfaThumbnailRasterizeParams = {
  source: HTMLElement
  canvas: HTMLCanvasElement
  cssWidth: number
  cssHeight: number
  pixelRatio: number
}

export type VPdfXfaThumbnailRasterizer = (
  params: VPdfXfaThumbnailRasterizeParams,
) => Promise<void>

type ThumbnailRenderOptions = {
  cssWidth?: number
  rotation?: number
  pixelRatio?: number
  wrap?: HTMLElement
  rasterizeXfa?: VPdfXfaThumbnailRasterizer
  /** @internal Test hook for XfaLayer import. */
  loadXfaLayer?: () => Promise<XfaLayerApi>
}

interface XfaLayerApi {
  render(parameters: {
    viewport: { clone: (params: { dontFlip: boolean }) => unknown }
    div: HTMLDivElement
    xfaHtml: unknown
    linkService: { addLinkAttributes: (element: HTMLElement, url: string, newWindow?: boolean) => void }
    intent?: string
  }): unknown
  getPageViewport(
    xfaPage: unknown,
    params: { scale?: number; rotation?: number },
  ): ThumbnailViewport & { clone: (params: { dontFlip: boolean }) => { clone: (params: { dontFlip: boolean }) => unknown } }
}

const thumbXfaLinkService = {
  addLinkAttributes() {},
}

let xfaLayerModulePromise: Promise<{ XfaLayer: XfaLayerApi }> | undefined

function loadXfaLayerModule(): Promise<{ XfaLayer: XfaLayerApi }> {
  xfaLayerModulePromise ??= import('pdfjs-dist/legacy/build/pdf.mjs') as unknown as Promise<{
    XfaLayer: XfaLayerApi
  }>
  return xfaLayerModulePromise
}

export function thumbnailPixelRatio(devicePixelRatio = 1): number {
  // ponytail: cap DPR at 2; raise if retina-quality thumbs matter more than memory
  return Math.min(Math.max(devicePixelRatio, 1), THUMBNAIL_MAX_PIXEL_RATIO)
}

export function isRenderCancelled(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const name = 'name' in error ? String(error.name) : ''
  const message = 'message' in error ? String(error.message) : ''
  return name === 'RenderingCancelledException' || /cancel/i.test(message)
}

export function clearThumbnailPreview(canvas: HTMLCanvasElement, wrap?: HTMLElement) {
  canvas.style.display = ''
  canvas.width = 0
  canvas.height = 0
  canvas.style.width = ''
  canvas.style.height = ''
  wrap?.querySelectorAll('.vpdf-thumb-xfa, .xfaLayer').forEach((node) => node.remove())
}

function renderCanvasThumbnail(
  page: ThumbnailPage,
  canvas: HTMLCanvasElement,
  options: ThumbnailRenderOptions,
): ThumbnailRenderTask {
  const cssWidth = options.cssWidth ?? THUMBNAIL_CSS_WIDTH
  const rotation = options.rotation ?? 0
  const ratio = thumbnailPixelRatio(options.pixelRatio ?? 1)
  const base = page.getViewport({ scale: 1, rotation })
  const cssScale = cssWidth / Math.max(base.width, 1)
  const viewport = page.getViewport({ scale: cssScale * ratio, rotation })
  let context: CanvasRenderingContext2D | null
  try {
    context = canvas.getContext('2d')
  } catch {
    context = null
  }
  if (!context) {
    return {
      promise: Promise.reject(new Error('Canvas 2D context unavailable')),
      cancel() {},
    }
  }

  if (options.wrap) clearThumbnailPreview(canvas, options.wrap)

  canvas.width = Math.max(1, Math.ceil(viewport.width))
  canvas.height = Math.max(1, Math.ceil(viewport.height))
  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${(base.height * cssScale).toFixed(2)}px`

  return page.render({ canvasContext: context, canvas, viewport })
}

function renderXfaThumbnail(
  xfaHtml: unknown,
  canvas: HTMLCanvasElement,
  wrap: HTMLElement,
  options: ThumbnailRenderOptions,
): ThumbnailRenderTask {
  let cancelled = false
  const cancel = () => {
    cancelled = true
  }

  const promise = (async () => {
    const XfaLayer = options.loadXfaLayer
      ? await options.loadXfaLayer()
      : (await loadXfaLayerModule()).XfaLayer
    if (cancelled) {
      throw Object.assign(new Error('Rendering cancelled'), { name: 'RenderingCancelledException' })
    }

    const cssWidth = options.cssWidth ?? THUMBNAIL_CSS_WIDTH
    const rotation = options.rotation ?? 0
    const base = XfaLayer.getPageViewport(xfaHtml, { scale: 1, rotation })
    const cssScale = cssWidth / Math.max(base.width, 1)
    const viewport = XfaLayer.getPageViewport(xfaHtml, { scale: cssScale, rotation })
    const cssHeight = base.height * cssScale

    clearThumbnailPreview(canvas, wrap)

    const shell = document.createElement('div')
    shell.className = 'vpdf-thumb-xfa'
    shell.style.width = `${cssWidth}px`
    shell.style.height = `${cssHeight.toFixed(2)}px`
    shell.inert = true
    shell.setAttribute('aria-hidden', 'true')

    const layerHost = document.createElement('div')

    const staging = document.createElement('div')
    staging.style.position = 'fixed'
    staging.style.left = '-10000px'
    staging.style.top = '0'
    staging.style.width = `${viewport.width}px`
    staging.style.height = `${viewport.height}px`
    staging.style.overflow = 'hidden'
    document.body.appendChild(staging)

    try {
      shell.appendChild(layerHost)
      staging.appendChild(shell)
      XfaLayer.render({
        xfaHtml,
        div: layerHost,
        viewport: viewport.clone({ dontFlip: true }),
        linkService: thumbXfaLinkService,
        intent: 'display',
      })
      layerHost.style.width = `${Math.ceil(viewport.width)}px`
      layerHost.style.height = `${Math.ceil(viewport.height)}px`
      layerHost.style.transformOrigin = '0 0'
      if (cancelled) {
        throw Object.assign(new Error('Rendering cancelled'), { name: 'RenderingCancelledException' })
      }

      if (options.rasterizeXfa) {
        const pixelRatio = thumbnailPixelRatio(options.pixelRatio ?? 1)
        await options.rasterizeXfa({
          source: shell,
          canvas,
          cssWidth,
          cssHeight,
          pixelRatio,
        })
        if (cancelled) {
          throw Object.assign(new Error('Rendering cancelled'), { name: 'RenderingCancelledException' })
        }
        canvas.style.display = ''
        canvas.style.width = `${cssWidth}px`
        canvas.style.height = `${cssHeight.toFixed(2)}px`
        return
      }

      canvas.style.display = 'none'
      wrap.appendChild(shell)
    } finally {
      staging.remove()
    }
  })()

  return { promise, cancel }
}

export function renderPdfThumbnail(
  page: ThumbnailPage,
  canvas: HTMLCanvasElement,
  options: ThumbnailRenderOptions = {},
): ThumbnailRenderTask {
  if (typeof page.getXfa !== 'function') {
    return renderCanvasThumbnail(page, canvas, options)
  }

  let cancelled = false
  let innerTask: ThumbnailRenderTask | undefined
  const cancel = () => {
    cancelled = true
    innerTask?.cancel()
  }

  const promise = page.getXfa().then((xfaHtml) => {
    if (cancelled) {
      throw Object.assign(new Error('Rendering cancelled'), { name: 'RenderingCancelledException' })
    }
    if (xfaHtml && options.wrap) {
      innerTask = renderXfaThumbnail(xfaHtml, canvas, options.wrap, options)
      return innerTask.promise
    }
    innerTask = renderCanvasThumbnail(page, canvas, options)
    return innerTask.promise
  })

  return { promise, cancel }
}
