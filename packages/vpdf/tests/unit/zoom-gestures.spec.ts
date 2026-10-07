import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { PluginManager } from '../../src/plugins/manager'
import { createZoomPlugin, VPDF_BUILTIN_PLUGIN_IDS } from '../../src/plugins/builtins'
import {
  applyFocalScroll,
  bindZoomGestures,
  clampScale,
  scaleFromPinch,
  scaleFromWheelDelta,
} from '../../src/plugins/builtins/zoomGestures'
import { MAX_SCALE, MIN_SCALE } from '../../src/utils/zoom'
import { createInitialViewerState } from '../../src/utils/defaults'
import type { VPdfViewerController, VPdfViewerOptions } from '../../src/types'

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

function fakeTouch(target: EventTarget, id: number, clientX: number, clientY: number): Touch {
  return { identifier: id, target, clientX, clientY } as unknown as Touch
}

function dispatchTouch(target: HTMLElement, type: string, touches: Touch[]) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'touches', { value: touches })
  target.dispatchEvent(event)
  return event
}
function mountScroller() {
  const host = document.createElement('div')
  const scroller = document.createElement('div')
  scroller.className = 'vpdf-viewer-scroll'
  scroller.scrollLeft = 40
  scroller.scrollTop = 80
  Object.defineProperty(scroller, 'getBoundingClientRect', {
    value: () => ({ left: 10, top: 20, right: 210, bottom: 220, width: 200, height: 200, x: 10, y: 20, toJSON: () => ({}) }),
  })
  host.append(scroller)
  document.body.append(host)
  return { host, scroller }
}

describe('zoom gesture math', () => {
  it('clamps scale to the viewer limits', () => {
    expect(clampScale(0.1)).toBe(MIN_SCALE)
    expect(clampScale(12)).toBe(MAX_SCALE)
    expect(clampScale(1.5)).toBe(1.5)
  })

  it('zooms in and out from wheel delta', () => {
    expect(scaleFromWheelDelta(1, -100)).toBeGreaterThan(1)
    expect(scaleFromWheelDelta(1, 100)).toBeLessThan(1)
    expect(scaleFromWheelDelta(MIN_SCALE, 10_000)).toBe(MIN_SCALE)
    expect(scaleFromWheelDelta(MAX_SCALE, -10_000)).toBe(MAX_SCALE)
  })

  it('scales from pinch distance ratios', () => {
    expect(scaleFromPinch(1, 100, 200)).toBe(2)
    expect(scaleFromPinch(2, 200, 100)).toBe(1)
    expect(scaleFromPinch(1, 0, 100)).toBe(1)
  })

  it('keeps the focal document point under the pointer', () => {
    const el = document.createElement('div')
    el.scrollLeft = 40
    el.scrollTop = 80
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ left: 10, top: 20, right: 210, bottom: 220, width: 200, height: 200, x: 10, y: 20, toJSON: () => ({}) }),
    })
    applyFocalScroll(el, 60, 70, 1, 2)
    expect(el.scrollLeft).toBe(130)
    expect(el.scrollTop).toBe(210)
  })
})

describe('bindZoomGestures', () => {
  let dispose: (() => void) | undefined

  afterEach(() => {
    dispose?.()
    dispose = undefined
    document.body.replaceChildren()
  })

  it('zooms with Ctrl or Meta wheel and ignores ordinary scroll', () => {
    const { host, scroller } = mountScroller()
    const setScale = vi.fn()
    dispose = bindZoomGestures({ host, getScale: () => 1, setScale })

    scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: 80, deltaMode: 0, cancelable: true }))
    expect(setScale).not.toHaveBeenCalled()

    const ctrl = new WheelEvent('wheel', { deltaY: 80, deltaMode: 0, ctrlKey: true, cancelable: true, clientX: 60, clientY: 70 })
    scroller.dispatchEvent(ctrl)
    expect(ctrl.defaultPrevented).toBe(true)
    expect(setScale).toHaveBeenCalledTimes(1)
    expect(setScale.mock.calls[0]![0]).toBeLessThan(1)

    const meta = new WheelEvent('wheel', { deltaY: -80, deltaMode: 0, metaKey: true, cancelable: true, clientX: 60, clientY: 70 })
    scroller.dispatchEvent(meta)
    expect(setScale.mock.calls[1]![0]).toBeGreaterThan(1)
  })

  it('pinch-zooms around the touch midpoint', () => {
    const { host, scroller } = mountScroller()
    const setScale = vi.fn()
    dispose = bindZoomGestures({ host, getScale: () => 1, setScale })

    const start = dispatchTouch(scroller, 'touchstart', [
      fakeTouch(scroller, 1, 40, 80),
      fakeTouch(scroller, 2, 140, 80),
    ])
    expect(start).toBeTruthy()

    const move = dispatchTouch(scroller, 'touchmove', [
      fakeTouch(scroller, 1, 20, 80),
      fakeTouch(scroller, 2, 180, 80),
    ])
    expect(move.defaultPrevented).toBe(true)
    expect(setScale).toHaveBeenCalledWith(1.6)
  })

  it('does not treat a single-finger pan as zoom', () => {
    const { host, scroller } = mountScroller()
    const setScale = vi.fn()
    dispose = bindZoomGestures({ host, getScale: () => 1, setScale })
    dispatchTouch(scroller, 'touchstart', [fakeTouch(scroller, 1, 40, 80)])
    dispatchTouch(scroller, 'touchmove', [fakeTouch(scroller, 1, 80, 120)])
    expect(setScale).not.toHaveBeenCalled()
  })

  it('removes listeners on dispose', () => {
    const { host, scroller } = mountScroller()
    const setScale = vi.fn()
    dispose = bindZoomGestures({ host, getScale: () => 1, setScale })
    dispose()
    dispose = undefined
    scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: 80, deltaMode: 0, ctrlKey: true, cancelable: true }))
    expect(setScale).not.toHaveBeenCalled()
  })
})

describe('zoom plugin gestures', () => {
  it('binds through the viewer host and unbinds when disabled', async () => {
    const hostEl = document.createElement('div')
    const scroller = document.createElement('div')
    scroller.className = 'vpdf-viewer-scroll'
    hostEl.append(scroller)
    document.body.append(hostEl)

    const viewerHost = ref<HTMLElement>()
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [createZoomPlugin()],
    }, viewerHost)

    await vi.waitFor(() => expect(manager.shortcutsView.value.length).toBeGreaterThan(0))
    viewerHost.value = hostEl
    await nextTick()

    scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: 80, deltaMode: 0, ctrlKey: true, cancelable: true, clientX: 10, clientY: 10 }))
    expect(controller.setScale).toHaveBeenCalled()

    ;(controller.setScale as ReturnType<typeof vi.fn>).mockClear()
    manager.setEnabled(VPDF_BUILTIN_PLUGIN_IDS.zoom, false)
    await nextTick()
    scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: 80, deltaMode: 0, ctrlKey: true, cancelable: true, clientX: 10, clientY: 10 }))
    expect(controller.setScale).not.toHaveBeenCalled()

    hostEl.remove()
    manager.dispose()
  })
})
