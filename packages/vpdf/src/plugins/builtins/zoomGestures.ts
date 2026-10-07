import { normalizeWheelEventDelta } from '../../engine/pageVirtualScroll'
import { MAX_SCALE, MIN_SCALE } from '../../utils/zoom'

const WHEEL_ZOOM_SENSITIVITY = 400

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
}

export function scaleFromWheelDelta(current: number, delta: number): number {
  return clampScale(current * Math.exp(-delta / WHEEL_ZOOM_SENSITIVITY))
}

export function scaleFromPinch(startScale: number, startDistance: number, distance: number): number {
  if (startDistance <= 0) return clampScale(startScale)
  return clampScale(startScale * (distance / startDistance))
}

export function applyFocalScroll(
  scroller: HTMLElement,
  clientX: number,
  clientY: number,
  fromScale: number,
  toScale: number,
): void {
  if (fromScale <= 0 || fromScale === toScale) return
  const ratio = toScale / fromScale
  const rect = scroller.getBoundingClientRect()
  const x = clientX - rect.left
  const y = clientY - rect.top
  scroller.scrollLeft = (scroller.scrollLeft + x) * ratio - x
  scroller.scrollTop = (scroller.scrollTop + y) * ratio - y
}

function touchDistance(a: Touch, b: Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

function touchMidpoint(a: Touch, b: Touch): { x: number; y: number } {
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 }
}

function resolveScroller(host: HTMLElement): HTMLElement {
  return (host.querySelector('.vpdf-viewer-scroll') as HTMLElement | null) ?? host
}

export interface BindZoomGesturesOptions {
  host: HTMLElement
  getScale: () => number
  setScale: (scale: number) => void
  enabled?: () => boolean
}

export function bindZoomGestures(options: BindZoomGesturesOptions): () => void {
  const scroller = resolveScroller(options.host)
  const enabled = () => options.enabled?.() !== false

  let pinchStartDistance = 0
  let pinchStartScale = 1

  const applyScaleAt = (next: number, clientX: number, clientY: number) => {
    const current = options.getScale()
    if (next === current) return
    options.setScale(next)
    applyFocalScroll(scroller, clientX, clientY, current, next)
  }

  const onWheel = (event: WheelEvent) => {
    if (!enabled()) return
    if (!event.ctrlKey && !event.metaKey) return
    event.preventDefault()
    applyScaleAt(
      scaleFromWheelDelta(options.getScale(), normalizeWheelEventDelta(event)),
      event.clientX,
      event.clientY,
    )
  }

  const onTouchStart = (event: TouchEvent) => {
    if (!enabled() || event.touches.length !== 2) return
    const first = event.touches[0]
    const second = event.touches[1]
    if (!first || !second) return
    pinchStartDistance = touchDistance(first, second)
    pinchStartScale = options.getScale()
  }

  const onTouchMove = (event: TouchEvent) => {
    if (!enabled() || event.touches.length !== 2 || pinchStartDistance <= 0) return
    const first = event.touches[0]
    const second = event.touches[1]
    if (!first || !second) return
    event.preventDefault()
    const midpoint = touchMidpoint(first, second)
    applyScaleAt(
      scaleFromPinch(pinchStartScale, pinchStartDistance, touchDistance(first, second)),
      midpoint.x,
      midpoint.y,
    )
  }

  const endPinch = () => {
    pinchStartDistance = 0
  }

  scroller.addEventListener('wheel', onWheel, { passive: false })
  scroller.addEventListener('touchstart', onTouchStart, { passive: true })
  scroller.addEventListener('touchmove', onTouchMove, { passive: false })
  scroller.addEventListener('touchend', endPinch)
  scroller.addEventListener('touchcancel', endPinch)

  return () => {
    scroller.removeEventListener('wheel', onWheel)
    scroller.removeEventListener('touchstart', onTouchStart)
    scroller.removeEventListener('touchmove', onTouchMove)
    scroller.removeEventListener('touchend', endPinch)
    scroller.removeEventListener('touchcancel', endPinch)
    endPinch()
  }
}
