import { describe, expect, it, vi } from 'vitest'
import {
  clearThumbnailPreview,
  isRenderCancelled,
  renderPdfThumbnail,
  thumbnailPixelRatio,
} from '../../src/utils/renderThumbnail'

describe('thumbnail helpers', () => {
  it('caps device pixel ratio and detects cancelled renders', () => {
    expect(thumbnailPixelRatio(1)).toBe(1)
    expect(thumbnailPixelRatio(3)).toBe(2)
    expect(isRenderCancelled({ name: 'RenderingCancelledException' })).toBe(true)
    expect(isRenderCancelled(new Error('Rendering cancelled'))).toBe(true)
    expect(isRenderCancelled(new Error('boom'))).toBe(false)
  })

  it('sizes the canvas from page aspect ratio and pixel ratio', () => {
    const canvas = document.createElement('canvas')
    const context = {} as CanvasRenderingContext2D
    vi.spyOn(canvas, 'getContext').mockReturnValue(context)
    const render = vi.fn(() => ({ promise: Promise.resolve(), cancel: vi.fn() }))
    const page = {
      getViewport: vi.fn(({ scale = 1 }: { scale?: number }) => ({
        width: 100 * scale,
        height: 150 * scale,
      })),
      render,
    }
    renderPdfThumbnail(page, canvas, { cssWidth: 88, pixelRatio: 2, rotation: 0 })
    expect(canvas.width).toBe(176)
    expect(canvas.height).toBe(264)
    expect(canvas.style.width).toBe('88px')
    expect(render).toHaveBeenCalledWith(
      expect.objectContaining({ canvasContext: context, canvas }),
    )
  })

  it('renders XFA pages with XfaLayer instead of canvas render', async () => {
    const canvas = document.createElement('canvas')
    const wrap = document.createElement('div')
    const xfaHtml = { name: 'div', attributes: { style: { width: '100px', height: '150px' } } }
    const render = vi.fn(() => ({ promise: Promise.resolve(), cancel: vi.fn() }))
    const loadXfaLayer = vi.fn(async () => ({
      getPageViewport: () => ({
        width: 88,
        height: 132,
        clone: () => ({ width: 88, height: 132, clone: () => ({ width: 88, height: 132 }) }),
      }),
      render: ({ div }: { div: HTMLDivElement }) => {
        div.textContent = 'XFA thumbnail'
        const input = document.createElement('input')
        input.type = 'text'
        const select = document.createElement('select')
        select.appendChild(document.createElement('option'))
        div.append(input, select)
      },
    }))
    const page = {
      getViewport: vi.fn(({ scale = 1 }: { scale?: number }) => ({
        width: 100 * scale,
        height: 150 * scale,
      })),
      render,
      getXfa: vi.fn(async () => xfaHtml),
    }

    const task = renderPdfThumbnail(page, canvas, {
      cssWidth: 88,
      wrap,
      loadXfaLayer,
    })
    await task.promise

    expect(loadXfaLayer).toHaveBeenCalledTimes(1)
    expect(render).not.toHaveBeenCalled()
    expect(canvas.style.display).toBe('none')
    const shell = wrap.querySelector('.vpdf-thumb-xfa') as HTMLElement
    expect(shell.inert).toBe(true)
    expect(shell.getAttribute('aria-hidden')).toBe('true')
    expect(shell.querySelector('input')).toBeTruthy()
    expect(shell.querySelector('select')).toBeTruthy()
    expect(shell.textContent).toContain('XFA thumbnail')
  })

  it('rasterizes XFA HTML onto the thumbnail canvas when a rasterizer is provided', async () => {
    const canvas = document.createElement('canvas')
    const wrap = document.createElement('div')
    const xfaHtml = { name: 'div', attributes: { style: { width: '100px', height: '150px' } } }
    const rasterizeXfa = vi.fn(async ({ canvas: target, cssWidth, cssHeight, pixelRatio }) => {
      target.width = Math.ceil(cssWidth * pixelRatio)
      target.height = Math.ceil(cssHeight * pixelRatio)
    })
    const loadXfaLayer = vi.fn(async () => ({
      getPageViewport: () => ({
        width: 88,
        height: 132,
        clone: () => ({ width: 88, height: 132, clone: () => ({ width: 88, height: 132 }) }),
      }),
      render: ({ div }: { div: HTMLDivElement }) => {
        div.textContent = 'XFA thumbnail'
      },
    }))
    const page = {
      getViewport: vi.fn(({ scale = 1 }: { scale?: number }) => ({
        width: 100 * scale,
        height: 150 * scale,
      })),
      render: vi.fn(),
      getXfa: vi.fn(async () => xfaHtml),
    }

    const task = renderPdfThumbnail(page, canvas, {
      cssWidth: 88,
      wrap,
      loadXfaLayer,
      rasterizeXfa,
    })
    await task.promise

    expect(rasterizeXfa).toHaveBeenCalledTimes(1)
    expect(wrap.querySelector('.vpdf-thumb-xfa')).toBeNull()
    expect(canvas.style.display).not.toBe('none')
    expect(canvas.style.width).toBe('88px')
    expect(canvas.width).toBe(88)
    expect(canvas.height).toBe(132)
  })

  it('clears orphaned xfa layers when resetting previews', () => {
    const canvas = document.createElement('canvas')
    const wrap = document.createElement('div')
    const shell = document.createElement('div')
    shell.className = 'vpdf-thumb-xfa'
    const layer = document.createElement('div')
    layer.className = 'xfaLayer'
    shell.appendChild(layer)
    wrap.append(shell)
    clearThumbnailPreview(canvas, wrap)
    expect(wrap.querySelector('.vpdf-thumb-xfa')).toBeNull()
    expect(wrap.querySelector('.xfaLayer')).toBeNull()
  })
})
