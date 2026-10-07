import { DEFAULT_PAGE_GAP } from '../utils/defaults'

/** Matches pdfjs-dist `ScrollMode.PAGE`. */
export const PDFJS_PAGE_SCROLL_MODE = 3

/** Typical PDF.js page chrome when the page is not in the DOM yet. */
export const DEFAULT_PAGE_GAP_PX = DEFAULT_PAGE_GAP

export interface VirtualPageView {
  div?: HTMLDivElement
  height?: number
  viewport?: { height: number }
}

export interface VirtualVisiblePage {
  id: number
  x: number
  y: number
  visibleArea: null
  view: VirtualPageView
  percent: number
  widthPercent: number
}

export interface VirtualVisiblePages {
  first: VirtualVisiblePage
  last: VirtualVisiblePage
  views: VirtualVisiblePage[]
  ids: Set<number>
}

export interface VirtualPdfViewer {
  currentPageNumber: number
  pagesCount: number
  getPageView(index: number): VirtualPageView | undefined
  /** PDF.js visibility checks fail under absolute virtual-scroll positioning; force draw instead. */
  forceRenderPage?(pageNumber: number): void
}

export interface PageVirtualLayout {
  heights: number[]
  starts: number[]
  totalHeight: number
}

export function buildPageVirtualLayout(heights: number[]): PageVirtualLayout {
  const starts = Array.from({ length: heights.length + 1 }, () => 0)
  for (let i = 0; i < heights.length; i++) {
    starts[i + 1] = (starts[i] ?? 0) + Math.max(0, heights[i] ?? 0)
  }
  return { heights, starts, totalHeight: starts[heights.length] ?? 0 }
}

export function resolvePageFromScrollTop(
  starts: number[],
  scrollTop: number,
): { pageIndex: number; offsetY: number } {
  if (starts.length <= 1) return { pageIndex: 0, offsetY: 0 }
  const maxPage = starts.length - 2
  let lo = 0
  let hi = maxPage
  const y = Math.max(0, scrollTop)
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if ((starts[mid] ?? 0) <= y) lo = mid
    else hi = mid - 1
  }
  return { pageIndex: lo, offsetY: y - (starts[lo] ?? 0) }
}

export function documentScrollHeight(contentHeight: number, lastPageHeight: number, clientHeight: number): number {
  return contentHeight + Math.max(0, clientHeight - Math.max(0, lastPageHeight))
}

export function clampScrollTop(scrollTop: number, totalHeight: number, clientHeight: number): number {
  const max = Math.max(0, totalHeight - Math.max(0, clientHeight))
  return Math.min(max, Math.max(0, scrollTop))
}

export function pageJumpScrollOffset(pageStart: number, pageSize: number, clientSize: number): number {
  if (pageSize > clientSize) return pageStart
  return pageStart - (clientSize - pageSize) / 2
}

/** Vertical inset that centers a page that fits in the viewport. */
export function pageFitInset(pageSize: number, clientSize: number): number {
  if (pageSize >= clientSize) return 0
  return (clientSize - pageSize) / 2
}

export type PageSnapEdge = 'start' | 'end'

/** Document scrollTop for a page: fitted pages stay at pageStart (inset centers them). */
export function pageBoundaryScrollOffset(
  pageStart: number,
  pageHeight: number,
  clientHeight: number,
  edge: PageSnapEdge,
): number {
  if (pageHeight <= clientHeight) return pageStart
  if (edge === 'end') return pageStart + pageHeight - clientHeight
  return pageStart
}

const LINE_HEIGHT = 40
const PAGE_HEIGHT = 800

export function normalizeWheelEventDelta(event: WheelEvent): number {
  let delta = event.deltaY
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= LINE_HEIGHT
  else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= PAGE_HEIGHT
  return delta
}

export const PAGE_TURN_LOCK_MS = 250
export const PAGE_EDGE_EPSILON_PX = 1

export function rebuildScrollTopPreservingAnchor(options: {
  pageIndex: number
  offsetY: number
  oldHeights: number[]
  newStarts: number[]
  newHeights: number[]
}): number {
  const oldHeight = Math.max(1, options.oldHeights[options.pageIndex] ?? 1)
  const ratio = options.offsetY / oldHeight
  const nextStart = options.newStarts[options.pageIndex] ?? 0
  const nextHeight = options.newHeights[options.pageIndex] ?? 0
  return nextStart + ratio * nextHeight
}

export function measurePageOuterHeight(view: VirtualPageView | undefined, fallbackGap: number): number {
  const inner = view?.height ?? view?.viewport?.height ?? 0
  const div = view?.div
  if (div?.isConnected) {
    const style = getComputedStyle(div)
    const marginTop = Number.parseFloat(style.marginTop) || 0
    const marginBottom = Number.parseFloat(style.marginBottom) || 0
    const outer = div.offsetHeight + marginTop + marginBottom
    if (outer > 0 && outer >= inner) return outer
  }
  return Math.max(0, inner + fallbackGap)
}

export function measureFallbackGap(view: VirtualPageView | undefined): number {
  const inner = view?.height ?? view?.viewport?.height ?? 0
  const div = view?.div
  if (!div?.isConnected || inner <= 0) return DEFAULT_PAGE_GAP_PX
  const style = getComputedStyle(div)
  const marginTop = Number.parseFloat(style.marginTop) || 0
  const marginBottom = Number.parseFloat(style.marginBottom) || 0
  const outer = div.offsetHeight + marginTop + marginBottom
  if (outer <= 0) return DEFAULT_PAGE_GAP_PX
  return Math.max(0, outer - inner)
}

export class PageVirtualScroll {
  private enabled = false
  private container?: HTMLDivElement
  private viewerEl?: HTMLElement
  private pdfViewer?: VirtualPdfViewer
  private track?: HTMLDivElement
  private heights: number[] = []
  private starts: number[] = [0]
  private totalHeight = 0
  private virtualScrollTop = 0
  private suppressScrollSync = false
  private suppressPageSync = false
  private restoreTimer?: ReturnType<typeof setTimeout>
  private pageTurnTimer?: ReturnType<typeof setTimeout>
  private pageTurnLocked = false
  private onScroll?: () => void
  private onWheel?: (event: WheelEvent) => void

  get isEnabled(): boolean {
    return this.enabled
  }

  enable(container: HTMLDivElement, viewerEl: HTMLElement, pdfViewer: VirtualPdfViewer): void {
    this.container = container
    this.viewerEl = viewerEl
    this.pdfViewer = pdfViewer

    if (!this.enabled) {
      this.enabled = true
      container.classList.add('vpdf-single-page')
      this.ensureTrack()
      this.onScroll = () => this.handleScroll()
      this.onWheel = (event) => this.handleWheel(event)
      container.addEventListener('scroll', this.onScroll, { passive: true })
      container.addEventListener('wheel', this.onWheel, { passive: false })
    }

    this.rebuildLayout()
    this.applyDocumentScroll(container.scrollTop)
  }

  disable(): void {
    if (!this.enabled) return
    const container = this.container
    const viewerEl = this.viewerEl
    if (this.onScroll && container) {
      container.removeEventListener('scroll', this.onScroll)
    }
    if (this.onWheel && container) {
      container.removeEventListener('wheel', this.onWheel)
    }
    if (this.restoreTimer) {
      clearTimeout(this.restoreTimer)
      this.restoreTimer = undefined
    }
    if (this.pageTurnTimer) {
      clearTimeout(this.pageTurnTimer)
      this.pageTurnTimer = undefined
    }
    this.unwrapTrack()
    if (viewerEl) {
      viewerEl.style.top = ''
      viewerEl.style.left = ''
      viewerEl.style.right = ''
      viewerEl.style.position = ''
    }
    container?.classList.remove('vpdf-single-page')
    this.enabled = false
    this.container = undefined
    this.viewerEl = undefined
    this.pdfViewer = undefined
    this.onScroll = undefined
    this.onWheel = undefined
    this.pageTurnLocked = false
    this.heights = []
    this.starts = [0]
    this.totalHeight = 0
    this.virtualScrollTop = 0
    this.suppressScrollSync = false
    this.suppressPageSync = false
  }

  goToPage(pageNumber: number, behavior: ScrollBehavior = 'auto'): void {
    this.scrollToPage(pageNumber, 'start', behavior)
  }

  onExternalPageChange(pageNumber: number): void {
    if (!this.enabled || this.suppressPageSync || !this.container) return
    const pageStart = this.starts[pageNumber - 1] ?? 0
    const local = this.container.scrollTop
    if (local < pageStart) {
      const pageHeight = this.heights[pageNumber - 1] ?? 0
      this.applyDocumentScroll(pageStart + Math.min(Math.max(0, local), Math.max(0, pageHeight)))
      return
    }
    this.applyDocumentScroll(local)
  }

  onPagesLoaded(): void {
    if (!this.enabled) return
    this.rebuildLayout()
    this.applyDocumentScroll(this.virtualScrollTop)
  }

  onGeometryChange(): void {
    if (!this.enabled || !this.pdfViewer) return
    const pageIndex = Math.max(0, this.pdfViewer.currentPageNumber - 1)
    const offsetY = this.virtualScrollTop - (this.starts[pageIndex] ?? 0)
    const oldHeights = this.heights
    this.rebuildLayout()
    if (heightsEqual(oldHeights, this.heights)) return
    const nextTop = rebuildScrollTopPreservingAnchor({
      pageIndex,
      offsetY,
      oldHeights,
      newStarts: this.starts,
      newHeights: this.heights,
    })
    this.applyDocumentScroll(nextTop)
  }

  applyDocumentScroll(targetTop: number, _behavior: ScrollBehavior = 'auto'): void {
    if (!this.enabled || !this.container || !this.pdfViewer || !this.viewerEl) return
    const clamped = clampScrollTop(targetTop, this.totalHeight, this.container.clientHeight)
    this.virtualScrollTop = clamped
    const { pageIndex } = resolvePageFromScrollTop(this.starts, clamped)
    const pageNumber = pageIndex + 1
    this.suppressScrollSync = true
    this.setCurrentPage(pageNumber)
    this.positionCurrentPage(pageNumber)
    this.restoreScrollTop(clamped)
  }

  private scrollToPage(pageNumber: number, edge: PageSnapEdge, behavior: ScrollBehavior = 'auto'): void {
    if (!this.enabled || !this.pdfViewer) return
    const page = Math.min(Math.max(1, pageNumber), this.pdfViewer.pagesCount)
    const pageStart = this.starts[page - 1] ?? 0
    const pageHeight = this.heights[page - 1] ?? 0
    const clientHeight = this.container?.clientHeight ?? 0
    this.applyDocumentScroll(pageBoundaryScrollOffset(pageStart, pageHeight, clientHeight, edge), behavior)
  }

  private handleWheel(event: WheelEvent): void {
    if (!this.enabled || !this.container || !this.pdfViewer) return
    if (event.ctrlKey) return
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return

    const delta = normalizeWheelEventDelta(event)
    if (delta === 0) return

    if (this.pageTurnLocked) {
      event.preventDefault()
      return
    }

    const pageIndex = Math.max(0, this.pdfViewer.currentPageNumber - 1)
    const pageStart = this.starts[pageIndex] ?? 0
    const pageHeight = this.heights[pageIndex] ?? 0
    const clientHeight = this.container.clientHeight
    const lastPage = this.pdfViewer.pagesCount - 1

    if (pageHeight <= clientHeight) {
      event.preventDefault()
      const next = pageIndex + (delta > 0 ? 1 : -1)
      if (next < 0 || next > lastPage) return
      this.lockPageTurn()
      this.scrollToPage(next + 1, 'start')
      return
    }

    const minTop = pageStart
    const maxTop = pageStart + pageHeight - clientHeight
    const atTop = this.virtualScrollTop <= minTop + PAGE_EDGE_EPSILON_PX
    const atBottom = this.virtualScrollTop >= maxTop - PAGE_EDGE_EPSILON_PX

    if (delta > 0 && atBottom && pageIndex < lastPage) {
      event.preventDefault()
      this.lockPageTurn()
      this.scrollToPage(pageIndex + 2, 'start')
      return
    }
    if (delta < 0 && atTop && pageIndex > 0) {
      event.preventDefault()
      this.lockPageTurn()
      this.scrollToPage(pageIndex, 'end')
      return
    }

    event.preventDefault()
    const nextTop = Math.min(maxTop, Math.max(minTop, this.virtualScrollTop + delta))
    this.applyDocumentScroll(nextTop)
  }

  private lockPageTurn(): void {
    this.pageTurnLocked = true
    if (this.pageTurnTimer) clearTimeout(this.pageTurnTimer)
    this.pageTurnTimer = setTimeout(() => {
      this.pageTurnLocked = false
      this.pageTurnTimer = undefined
    }, PAGE_TURN_LOCK_MS)
  }

  private handleScroll(): void {
    if (!this.enabled || this.suppressScrollSync || !this.container || !this.pdfViewer) return
    this.virtualScrollTop = this.container.scrollTop
    const { pageIndex } = resolvePageFromScrollTop(this.starts, this.virtualScrollTop)
    const pageNumber = pageIndex + 1
    const pageHeight = this.heights[pageIndex] ?? 0
    const clientHeight = this.container.clientHeight
    const fitted = pageHeight <= clientHeight
    const pageStart = this.starts[pageIndex] ?? 0
    if (this.pdfViewer.currentPageNumber === pageNumber) {
      if (!fitted || this.virtualScrollTop === pageStart) return
    }
    this.suppressScrollSync = true
    this.setCurrentPage(pageNumber)
    this.positionCurrentPage(pageNumber)
    const snapTop = fitted ? pageStart : this.virtualScrollTop
    this.restoreScrollTop(snapTop)
  }

  private setCurrentPage(pageNumber: number): void {
    if (!this.pdfViewer || this.pdfViewer.currentPageNumber === pageNumber) return
    this.suppressPageSync = true
    this.pdfViewer.currentPageNumber = pageNumber
    this.pdfViewer.forceRenderPage?.(pageNumber)
    this.suppressPageSync = false
  }

  private positionCurrentPage(pageNumber: number): void {
    if (!this.viewerEl) return
    const pageStart = this.starts[pageNumber - 1] ?? 0
    const pageHeight = this.heights[pageNumber - 1] ?? 0
    const clientHeight = this.container?.clientHeight ?? 0
    this.viewerEl.style.top = `${pageStart + pageFitInset(pageHeight, clientHeight)}px`
    if (this.track) this.track.style.height = `${this.totalHeight}px`
  }

  private rebuildLayout(): void {
    if (!this.pdfViewer) return
    const sample = this.pdfViewer.getPageView(Math.max(0, this.pdfViewer.currentPageNumber - 1))
    const fallbackGap = measureFallbackGap(sample)
    const heights: number[] = []
    for (let i = 0; i < this.pdfViewer.pagesCount; i++) {
      heights.push(measurePageOuterHeight(this.pdfViewer.getPageView(i), fallbackGap))
    }
    const layout = buildPageVirtualLayout(heights)
    this.heights = layout.heights
    this.starts = layout.starts
    const clientHeight = this.container?.clientHeight ?? 0
    const lastHeight = heights[heights.length - 1] ?? 0
    this.totalHeight = documentScrollHeight(layout.totalHeight, lastHeight, clientHeight)
    if (this.track) this.track.style.height = `${this.totalHeight}px`
    this.positionCurrentPage(this.pdfViewer.currentPageNumber)
  }

  private restoreScrollTop(top: number): void {
    const container = this.container
    if (!container) return
    container.scrollTop = top
    if (this.restoreTimer) clearTimeout(this.restoreTimer)
    this.restoreTimer = setTimeout(() => {
      container.scrollTop = top
      this.virtualScrollTop = top
      this.suppressScrollSync = false
      this.restoreTimer = undefined
    }, 0)
  }

  private ensureTrack(): void {
    if (!this.container || !this.viewerEl) return
    const parent = this.viewerEl.parentElement
    if (parent?.classList.contains('vpdf-virtual-track')) {
      this.track = parent as HTMLDivElement
      return
    }
    const track = document.createElement('div')
    track.className = 'vpdf-virtual-track'
    parent?.insertBefore(track, this.viewerEl)
    track.append(this.viewerEl)
    this.track = track
  }

  private unwrapTrack(): void {
    const track = this.track
    const viewerEl = this.viewerEl
    if (!track || !viewerEl) {
      this.track = undefined
      return
    }
    track.parentElement?.insertBefore(viewerEl, track)
    track.remove()
    this.track = undefined
  }
}

function heightsEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}
