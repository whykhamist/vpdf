import type { VPdfXfaThumbnailRasterizeParams } from '@whykhamist/vpdf'

export type Html2CanvasFn = (
  element: HTMLElement,
  options?: {
    scale?: number
    width?: number
    height?: number
    backgroundColor?: string | null
    logging?: boolean
    useCORS?: boolean
  },
) => Promise<HTMLCanvasElement>

let html2canvasModulePromise: Promise<{ default: Html2CanvasFn }> | undefined

export function loadHtml2Canvas(): Promise<Html2CanvasFn> {
  html2canvasModulePromise ??= import('html2canvas')
  return html2canvasModulePromise.then((mod) => mod.default)
}

export async function rasterizeXfaThumbnail(
  params: VPdfXfaThumbnailRasterizeParams,
  html2canvas: Html2CanvasFn,
): Promise<void> {
  const shot = await html2canvas(params.source, {
    scale: params.pixelRatio,
    width: params.cssWidth,
    height: params.cssHeight,
    backgroundColor: null,
    logging: false,
    useCORS: true,
  })

  params.canvas.width = shot.width
  params.canvas.height = shot.height
  const context = params.canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }
  context.drawImage(shot, 0, 0)
}
