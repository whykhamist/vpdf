import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import VPdfViewer from '../../src/components/VPdfViewer.vue'
import { SmoothJumpLock } from '../../src/engine/smoothJumpLock'

vi.mock('../../src/engine/PdfEngine', () => ({
  PdfEngine: class {
    async mount() {}
    async destroy() {}
    async load() {}
    async closeDocument() {}
  },
}))

describe('VPdfViewer smoothJump', () => {
  let wrapper: VueWrapper | undefined

  afterEach(async () => {
    wrapper?.unmount()
    wrapper = undefined
  })

  it('adds the smooth-jump class only when the option is enabled', async () => {
    wrapper = mount(VPdfViewer, {
      props: { options: { smoothJump: true } },
    })
    await flushPromises()
    expect(wrapper.find('.vpdf-viewer-scroll').classes()).toContain('vpdf-smooth-jump')

    await wrapper.setProps({ options: { smoothJump: false } })
    expect(wrapper.find('.vpdf-viewer-scroll').classes()).not.toContain('vpdf-smooth-jump')
  })
})

describe('SmoothJumpLock', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function createScroll() {
    const scroll = document.createElement('div')
    document.body.append(scroll)
    return scroll
  }

  function navEngine(smooth: boolean) {
    const announced: number[] = []
    const lock = new SmoothJumpLock()
    const scroll = createScroll()
    let viewerPage = 1

    const announce = (page: number) => {
      announced.push(page)
    }

    const onPageChanging = (page: number) => {
      viewerPage = page
      if (lock.page !== undefined) return
      announce(page)
    }

    const jump = (page: number) => {
      if (smooth) {
        lock.start(page, scroll, () => announce(viewerPage))
        announce(page)
      }
      onPageChanging(page)
    }

    const next = () => jump((lock.page ?? viewerPage) + 1)

    return { announced, lock, scroll, jump, next, onPageChanging }
  }

  it('locks nav/thumbnail state to the jump target while intermediate pages appear', () => {
    const engine = navEngine(true)
    engine.jump(8)

    engine.onPageChanging(3)
    engine.onPageChanging(5)
    engine.onPageChanging(7)

    expect(engine.lock.page).toBe(8)
    expect(engine.announced).toEqual([8])
  })

  it('uses the locked target as the base for consecutive next jumps', () => {
    const engine = navEngine(true)
    engine.jump(4)
    engine.onPageChanging(2)
    engine.next()
    engine.onPageChanging(3)

    expect(engine.lock.page).toBe(5)
    expect(engine.announced).toEqual([4, 5])
  })

  it('settles to the viewport page when the smooth scroll completes', () => {
    const engine = navEngine(true)
    engine.jump(8)
    engine.onPageChanging(4)
    engine.onPageChanging(8)

    engine.scroll.dispatchEvent(new Event('scrollend'))

    expect(engine.lock.page).toBeUndefined()
    expect(engine.announced).toEqual([8, 8])
  })

  it('releases the lock when the user interrupts the jump', () => {
    const engine = navEngine(true)
    engine.jump(8)
    engine.onPageChanging(4)

    engine.scroll.dispatchEvent(new Event('wheel'))
    engine.onPageChanging(5)

    expect(engine.lock.page).toBeUndefined()
    expect(engine.announced).toEqual([8, 4, 5])
  })

  it('updates from every pagechanging event when smooth jump is disabled', () => {
    const engine = navEngine(false)
    engine.jump(8)
    engine.onPageChanging(3)
    engine.onPageChanging(5)

    expect(engine.lock.page).toBeUndefined()
    expect(engine.announced).toEqual([8, 3, 5])
  })

  it('settles after scroll events go idle when scrollend is missing', () => {
    vi.useFakeTimers()
    const engine = navEngine(true)
    engine.jump(6)
    engine.onPageChanging(2)
    engine.scroll.dispatchEvent(new Event('scroll'))

    vi.advanceTimersByTime(119)
    expect(engine.lock.page).toBe(6)

    vi.advanceTimersByTime(1)
    expect(engine.lock.page).toBeUndefined()
    expect(engine.announced).toEqual([6, 2])
  })
})
