import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildPageVirtualLayout,
  pageBoundaryScrollOffset,
  pageFitInset,
  pageJumpScrollOffset,
  clampScrollTop,
  DEFAULT_PAGE_GAP_PX,
  documentScrollHeight,
  normalizeWheelEventDelta,
  PAGE_TURN_LOCK_MS,
  PageVirtualScroll,
  rebuildScrollTopPreservingAnchor,
  resolvePageFromScrollTop,
  type VirtualPdfViewer,
} from '../../src/engine/pageVirtualScroll'

describe('page virtual layout math', () => {
  it('builds cumulative offsets for variable page heights', () => {
    const layout = buildPageVirtualLayout([100, 250, 80])
    expect(layout.starts).toEqual([0, 100, 350, 430])
    expect(layout.totalHeight).toBe(430)
  })

  it('resolves scrollbar position to page and intra-page offset', () => {
    const { starts } = buildPageVirtualLayout([100, 250, 80])
    expect(resolvePageFromScrollTop(starts, 0)).toEqual({ pageIndex: 0, offsetY: 0 })
    expect(resolvePageFromScrollTop(starts, 99)).toEqual({ pageIndex: 0, offsetY: 99 })
    expect(resolvePageFromScrollTop(starts, 100)).toEqual({ pageIndex: 1, offsetY: 0 })
    expect(resolvePageFromScrollTop(starts, 180)).toEqual({ pageIndex: 1, offsetY: 80 })
    expect(resolvePageFromScrollTop(starts, 400)).toEqual({ pageIndex: 2, offsetY: 50 })
  })

  it('clamps document scroll to the visible range', () => {
    expect(clampScrollTop(-20, 1000, 200)).toBe(0)
    expect(clampScrollTop(500, 1000, 200)).toBe(500)
    expect(clampScrollTop(900, 1000, 200)).toBe(800)
  })

  it('centers a page when it fits the viewport', () => {
    expect(pageJumpScrollOffset(100, 50, 200)).toBe(25)
    expect(pageJumpScrollOffset(100, 110, 200)).toBe(55)
  })

  it('aligns overflowing pages to the viewport start', () => {
    expect(pageJumpScrollOffset(100, 400, 200)).toBe(100)
    expect(pageJumpScrollOffset(370, 90, 80)).toBe(370)
  })

  it('aligns exact-fit pages to the viewport start', () => {
    expect(pageJumpScrollOffset(100, 200, 200)).toBe(100)
  })

  it('pads short last pages so every page start is reachable', () => {
    expect(documentScrollHeight(430, 80, 400)).toBe(750)
    expect(documentScrollHeight(430, 500, 400)).toBe(430)
  })

  it('preserves page-relative position after zoom or rotation', () => {
    expect(rebuildScrollTopPreservingAnchor({
      pageIndex: 1,
      offsetY: 50,
      oldHeights: [100, 200, 100],
      newStarts: [0, 200, 600],
      newHeights: [200, 400, 200],
    })).toBe(300)
  })

  it('centers fitted pages with a viewport inset', () => {
    expect(pageFitInset(50, 200)).toBe(75)
    expect(pageFitInset(200, 200)).toBe(0)
    expect(pageFitInset(400, 200)).toBe(0)
  })

  it('snaps overflowing pages to the start or end edge', () => {
    expect(pageBoundaryScrollOffset(100, 50, 200, 'start')).toBe(100)
    expect(pageBoundaryScrollOffset(100, 50, 200, 'end')).toBe(100)
    expect(pageBoundaryScrollOffset(100, 400, 200, 'start')).toBe(100)
    expect(pageBoundaryScrollOffset(100, 400, 200, 'end')).toBe(300)
  })

  it('normalizes line and page wheel deltas to pixels', () => {
    expect(normalizeWheelEventDelta(new WheelEvent('wheel', { deltaY: 80, deltaMode: 0 }))).toBe(80)
    expect(normalizeWheelEventDelta(new WheelEvent('wheel', { deltaY: 2, deltaMode: 1 }))).toBe(80)
    expect(normalizeWheelEventDelta(new WheelEvent('wheel', { deltaY: 1, deltaMode: 2 }))).toBe(800)
  })
})

describe('PageVirtualScroll', () => {
  let coordinator: PageVirtualScroll | undefined

  afterEach(() => {
    coordinator?.disable()
    coordinator = undefined
    document.body.replaceChildren()
    vi.useRealTimers()
  })

  function mountHost(heights: number[]) {
    const container = document.createElement('div')
    container.className = 'vpdf-viewer-scroll'
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 80 })
    const viewerEl = document.createElement('div')
    viewerEl.className = 'vpdf-viewer-pages'
    container.append(viewerEl)
    document.body.append(container)

    const pages = heights.map((height, index) => {
      const div = document.createElement('div')
      div.className = 'page'
      div.dataset.pageNumber = String(index + 1)
      viewerEl.append(div)
      return { div, height }
    })

    const viewer: VirtualPdfViewer = {
      currentPageNumber: 1,
      pagesCount: heights.length,
      getPageView(index) {
        return pages[index]
      },
    }

    Object.defineProperty(viewer, 'currentPageNumber', {
      configurable: true,
      get() {
        return this._page ?? 1
      },
      set(value: number) {
        this._page = value
        container.scrollTop = 0
      },
    })
    ;(viewer as VirtualPdfViewer & { _page?: number })._page = 1

    return { container, viewerEl, viewer, pageHeight: (index: number) => heights[index]! + DEFAULT_PAGE_GAP_PX }
  }

  it('sizes the track to the full document and positions the current page', () => {
    const { container, viewerEl, viewer, pageHeight } = mountHost([100, 250, 80])
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, viewerEl, viewer)

    const track = container.querySelector('.vpdf-virtual-track') as HTMLDivElement
    expect(track).toBeTruthy()
    expect(track.contains(viewerEl)).toBe(true)
    expect(Number.parseFloat(track.style.height)).toBe(pageHeight(0) + pageHeight(1) + pageHeight(2))
    expect(viewerEl.style.top).toBe('0px')
    expect(container.classList.contains('vpdf-single-page')).toBe(true)
  })

  it('keeps the current page while scrolling inside it', async () => {
    vi.useFakeTimers()
    const { container, viewerEl, viewer } = mountHost([300, 300])
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, viewerEl, viewer)
    await vi.advanceTimersByTimeAsync(0)

    container.scrollTop = 40
    container.dispatchEvent(new Event('scroll'))
    await vi.advanceTimersByTimeAsync(0)

    expect(viewer.currentPageNumber).toBe(1)
    expect(viewerEl.style.top).toBe('0px')
  })

  it('changes page at virtual boundaries and restores scroll after a PDF.js reset', async () => {
    vi.useFakeTimers()
    const { container, viewerEl, viewer, pageHeight } = mountHost([100, 250, 80])
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, viewerEl, viewer)
    await vi.advanceTimersByTimeAsync(0)

    const nextTop = pageHeight(0) + 20
    container.scrollTop = nextTop
    container.dispatchEvent(new Event('scroll'))
    await vi.advanceTimersByTimeAsync(0)

    expect(viewer.currentPageNumber).toBe(2)
    expect(viewerEl.style.top).toBe(`${pageHeight(0)}px`)
    expect(container.scrollTop).toBe(nextTop)
  })

  it('jumps through pages when the scrollbar is dragged', async () => {
    vi.useFakeTimers()
    const { container, viewerEl, viewer, pageHeight } = mountHost([100, 250, 80])
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, viewerEl, viewer)
    await vi.advanceTimersByTimeAsync(0)

    coordinator.applyDocumentScroll(pageHeight(0) + pageHeight(1) + 10)
    await vi.advanceTimersByTimeAsync(0)

    expect(viewer.currentPageNumber).toBe(3)
    expect(viewerEl.style.top).toBe(`${pageHeight(0) + pageHeight(1)}px`)
    expect(container.scrollTop).toBe(pageHeight(0) + pageHeight(1) + 10)
  })

  it('preserves the in-page offset after a geometry rebuild', async () => {
    vi.useFakeTimers()
    const { container, viewerEl, viewer } = mountHost([100, 200])
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, viewerEl, viewer)
    await vi.advanceTimersByTimeAsync(0)

    coordinator.applyDocumentScroll(100 + DEFAULT_PAGE_GAP_PX + 40)
    await vi.advanceTimersByTimeAsync(0)
    expect(viewer.currentPageNumber).toBe(2)

    const page2 = viewer.getPageView(1)!
    page2.height = 400
    coordinator.onGeometryChange()
    await vi.advanceTimersByTimeAsync(0)

    expect(viewer.currentPageNumber).toBe(2)
    const oldHeight = 200 + DEFAULT_PAGE_GAP_PX
    const newHeight = 400 + DEFAULT_PAGE_GAP_PX
    expect(container.scrollTop).toBe(100 + DEFAULT_PAGE_GAP_PX + (40 / oldHeight) * newHeight)
  })

  it('top-aligns overflowing pages on programmatic jump', async () => {
    vi.useFakeTimers()
    const { container, viewerEl, viewer, pageHeight } = mountHost([100, 250, 80])
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, viewerEl, viewer)
    await vi.advanceTimersByTimeAsync(0)

    coordinator.goToPage(3)
    await vi.advanceTimersByTimeAsync(0)

    const pageStart = pageHeight(0) + pageHeight(1)
    expect(viewer.currentPageNumber).toBe(3)
    expect(container.scrollTop).toBe(pageStart)
  })

  it('clamps centered first-page jumps when the offset is negative', async () => {
    vi.useFakeTimers()
    const { container, viewerEl, viewer } = mountHost([80])
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 200 })
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, viewerEl, viewer)
    await vi.advanceTimersByTimeAsync(0)

    coordinator.goToPage(1)
    await vi.advanceTimersByTimeAsync(0)

    expect(viewer.currentPageNumber).toBe(1)
    expect(container.scrollTop).toBe(0)
    expect(viewerEl.style.top).toBe(`${pageFitInset(80 + DEFAULT_PAGE_GAP_PX, 200)}px`)
  })

  it('unwraps the track and restores styles on disable', async () => {
    vi.useFakeTimers()
    const { container, viewerEl, viewer } = mountHost([100, 100])
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, viewerEl, viewer)
    await vi.advanceTimersByTimeAsync(0)

    coordinator.disable()
    coordinator = undefined

    expect(container.querySelector('.vpdf-virtual-track')).toBeNull()
    expect(container.contains(viewerEl)).toBe(true)
    expect(container.classList.contains('vpdf-single-page')).toBe(false)
    expect(viewerEl.style.top).toBe('')
  })

  function dispatchWheel(target: HTMLDivElement, deltaY: number, init: WheelEventInit = {}) {
    target.dispatchEvent(new WheelEvent('wheel', { deltaY, deltaMode: 0, cancelable: true, ...init }))
  }

  it('turns fitted pages with the wheel and keeps them centered', async () => {
    vi.useFakeTimers()
    const { container, viewerEl, viewer, pageHeight } = mountHost([80, 80, 80])
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 200 })
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, viewerEl, viewer)
    await vi.advanceTimersByTimeAsync(0)

    const inset = pageFitInset(pageHeight(0), 200)
    expect(viewerEl.style.top).toBe(`${inset}px`)

    dispatchWheel(container, 40)
    await vi.advanceTimersByTimeAsync(0)

    expect(viewer.currentPageNumber).toBe(2)
    expect(container.scrollTop).toBe(pageHeight(0))
    expect(viewerEl.style.top).toBe(`${pageHeight(0) + inset}px`)
  })

  it('does not leave the first or last fitted page', async () => {
    vi.useFakeTimers()
    const { container, viewer, pageHeight } = mountHost([80, 80])
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 200 })
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, container.querySelector('.vpdf-viewer-pages') as HTMLElement, viewer)
    await vi.advanceTimersByTimeAsync(0)

    dispatchWheel(container, -40)
    await vi.advanceTimersByTimeAsync(0)
    expect(viewer.currentPageNumber).toBe(1)

    coordinator.goToPage(2)
    await vi.advanceTimersByTimeAsync(PAGE_TURN_LOCK_MS)

    dispatchWheel(container, 40)
    await vi.advanceTimersByTimeAsync(0)
    expect(viewer.currentPageNumber).toBe(2)
    expect(container.scrollTop).toBe(pageHeight(0))
  })

  it('scrolls inside a zoomed page without changing pages', async () => {
    vi.useFakeTimers()
    const { container, viewerEl, viewer } = mountHost([300, 300])
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, viewerEl, viewer)
    await vi.advanceTimersByTimeAsync(0)

    dispatchWheel(container, 40)
    await vi.advanceTimersByTimeAsync(0)

    expect(viewer.currentPageNumber).toBe(1)
    expect(container.scrollTop).toBe(40)
    expect(viewerEl.style.top).toBe('0px')
  })

  it('clamps a zoomed page at its bottom before turning', async () => {
    vi.useFakeTimers()
    const { container, viewer, pageHeight } = mountHost([300, 300])
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, container.querySelector('.vpdf-viewer-pages') as HTMLElement, viewer)
    await vi.advanceTimersByTimeAsync(0)

    dispatchWheel(container, 10_000)
    await vi.advanceTimersByTimeAsync(0)

    expect(viewer.currentPageNumber).toBe(1)
    expect(container.scrollTop).toBe(pageHeight(0) - 80)
  })

  it('top-aligns the next zoomed page after a downward boundary wheel', async () => {
    vi.useFakeTimers()
    const { container, viewerEl, viewer, pageHeight } = mountHost([300, 300])
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, viewerEl, viewer)
    await vi.advanceTimersByTimeAsync(0)

    dispatchWheel(container, 10_000)
    await vi.advanceTimersByTimeAsync(0)
    dispatchWheel(container, 40)
    await vi.advanceTimersByTimeAsync(0)

    expect(viewer.currentPageNumber).toBe(2)
    expect(container.scrollTop).toBe(pageHeight(0))
    expect(viewerEl.style.top).toBe(`${pageHeight(0)}px`)
  })

  it('bottom-aligns the previous zoomed page after an upward boundary wheel', async () => {
    vi.useFakeTimers()
    const { container, viewerEl, viewer, pageHeight } = mountHost([300, 300])
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, viewerEl, viewer)
    await vi.advanceTimersByTimeAsync(0)

    coordinator.goToPage(2)
    await vi.advanceTimersByTimeAsync(0)
    dispatchWheel(container, -40)
    await vi.advanceTimersByTimeAsync(0)

    expect(viewer.currentPageNumber).toBe(1)
    expect(container.scrollTop).toBe(pageHeight(0) - 80)
    expect(viewerEl.style.top).toBe('0px')
  })

  it('ignores momentum wheels during the page-turn lock', async () => {
    vi.useFakeTimers()
    const { container, viewer, pageHeight } = mountHost([80, 80, 80])
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 200 })
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, container.querySelector('.vpdf-viewer-pages') as HTMLElement, viewer)
    await vi.advanceTimersByTimeAsync(0)

    dispatchWheel(container, 40)
    await vi.advanceTimersByTimeAsync(0)
    dispatchWheel(container, 40)
    await vi.advanceTimersByTimeAsync(0)

    expect(viewer.currentPageNumber).toBe(2)
    expect(container.scrollTop).toBe(pageHeight(0))

    await vi.advanceTimersByTimeAsync(PAGE_TURN_LOCK_MS)
    dispatchWheel(container, 40)
    await vi.advanceTimersByTimeAsync(0)
    expect(viewer.currentPageNumber).toBe(3)
  })

  it('snaps scrollbar movement on fitted pages back to center', async () => {
    vi.useFakeTimers()
    const { container, viewerEl, viewer, pageHeight } = mountHost([80, 80, 80])
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 200 })
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, viewerEl, viewer)
    await vi.advanceTimersByTimeAsync(0)

    container.scrollTop = pageHeight(0) + 10
    container.dispatchEvent(new Event('scroll'))
    await vi.advanceTimersByTimeAsync(0)

    const inset = pageFitInset(pageHeight(1), 200)
    expect(viewer.currentPageNumber).toBe(2)
    expect(container.scrollTop).toBe(pageHeight(0))
    expect(viewerEl.style.top).toBe(`${pageHeight(0) + inset}px`)
  })

  it('leaves Ctrl+wheel for the zoom plugin', async () => {
    vi.useFakeTimers()
    const { container, viewer } = mountHost([80, 80, 80])
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 200 })
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, container.querySelector('.vpdf-viewer-pages') as HTMLElement, viewer)
    await vi.advanceTimersByTimeAsync(0)

    dispatchWheel(container, 40, { ctrlKey: true })
    await vi.advanceTimersByTimeAsync(0)

    expect(viewer.currentPageNumber).toBe(1)
    expect(container.scrollTop).toBe(0)
  })

  it('removes the wheel listener on disable', async () => {
    vi.useFakeTimers()
    const { container, viewer } = mountHost([80, 80])
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 200 })
    coordinator = new PageVirtualScroll()
    coordinator.enable(container, container.querySelector('.vpdf-viewer-pages') as HTMLElement, viewer)
    await vi.advanceTimersByTimeAsync(0)

    coordinator.disable()
    coordinator = undefined

    dispatchWheel(container, 40)
    await vi.advanceTimersByTimeAsync(0)
    expect(viewer.currentPageNumber).toBe(1)
  })
})
