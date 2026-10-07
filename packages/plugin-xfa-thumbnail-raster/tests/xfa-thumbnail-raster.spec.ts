import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { PluginManager } from '../../vpdf/src/plugins/manager'
import { createInitialViewerState } from '../../vpdf/src/utils/defaults'
import type { VPdfViewerController, VPdfViewerOptions } from '../../vpdf/src/types'
import {
  createXfaThumbnailRasterPlugin,
  rasterizeXfaThumbnail,
  VPDF_XFA_THUMBNAIL_RASTER_PLUGIN_ID,
  type Html2CanvasFn,
} from '../src/index'

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

describe('createXfaThumbnailRasterPlugin', () => {
  it('registers an html2canvas rasterizer that paints onto the target canvas', async () => {
    const source = document.createElement('div')
    const shot = document.createElement('canvas')
    shot.width = 176
    shot.height = 264
    const html2canvas = vi.fn(async () => shot) as unknown as Html2CanvasFn
    const drawImage = vi.fn()
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D)

    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const manager = new PluginManager(state, options, createMockController())
    manager.register(createXfaThumbnailRasterPlugin({ html2canvas }))

    await vi.waitFor(() => expect(manager.xfaThumbnailRasterizerView.value).toBeTypeOf('function'))
    await manager.xfaThumbnailRasterizerView.value?.({
      source,
      canvas,
      cssWidth: 88,
      cssHeight: 132,
      pixelRatio: 2,
    })

    expect(html2canvas).toHaveBeenCalledWith(
      source,
      expect.objectContaining({ scale: 2, width: 88, height: 132 }),
    )
    expect(canvas.width).toBe(176)
    expect(canvas.height).toBe(264)
    expect(drawImage).toHaveBeenCalledWith(shot, 0, 0)
    expect(manager.list().some((entry) => entry.id === VPDF_XFA_THUMBNAIL_RASTER_PLUGIN_ID)).toBe(true)
  })

  it('copies html2canvas output onto the destination canvas', async () => {
    const source = document.createElement('div')
    const shot = document.createElement('canvas')
    shot.width = 10
    shot.height = 20
    const html2canvas = vi.fn(async () => shot)
    const canvas = document.createElement('canvas')
    const drawImage = vi.fn()
    vi.spyOn(canvas, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D)

    await rasterizeXfaThumbnail(
      { source, canvas, cssWidth: 5, cssHeight: 10, pixelRatio: 2 },
      html2canvas,
    )

    expect(html2canvas).toHaveBeenCalledTimes(1)
    expect(drawImage).toHaveBeenCalledWith(shot, 0, 0)
  })
})
