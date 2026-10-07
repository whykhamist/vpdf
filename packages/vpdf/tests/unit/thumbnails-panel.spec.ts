import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ThumbnailsPanel from '../../src/plugins/builtins/ThumbnailsPanel.vue'

class ImmediateIntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: number[] = []

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }

  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

function mockPage(options?: { cancel?: ReturnType<typeof vi.fn>; delay?: boolean }) {
  const cancel = options?.cancel ?? vi.fn()
  const render = vi.fn(() => {
    let rejectPromise: ((error: unknown) => void) | undefined
    const promise = options?.delay
      ? new Promise<void>((_resolve, reject) => {
          rejectPromise = reject
        })
      : Promise.resolve()
    if (options?.delay) {
      cancel.mockImplementation(() => {
        rejectPromise?.(
          Object.assign(new Error('Rendering cancelled'), { name: 'RenderingCancelledException' }),
        )
      })
    }
    return { promise, cancel }
  })
  return {
    page: {
      getViewport: vi.fn(({ scale = 1 }: { scale?: number }) => ({
        width: 100 * scale,
        height: 150 * scale,
      })),
      render,
    },
  }
}

describe('ThumbnailsPanel', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', ImmediateIntersectionObserver)
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders visible pages and keeps navigation/selection semantics', async () => {
    const onGoToPage = vi.fn()
    const { page } = mockPage()
    const getPage = vi.fn(async () => page)
    const wrapper = mount(ThumbnailsPanel, {
      props: {
        pageCount: 2,
        pageNumber: 2,
        ready: true,
        documentKey: 'doc-a',
        getPage,
        onGoToPage,
      },
    })
    await flushPromises()
    expect(getPage).toHaveBeenCalled()
    const buttons = wrapper.findAll('.vpdf-thumb')
    expect(buttons).toHaveLength(2)
    expect(buttons[1]!.attributes('aria-current')).toBe('page')
    expect(buttons[0]!.attributes('aria-current')).toBeUndefined()
    expect(buttons[0]!.text()).toContain('1')
    expect(buttons[0]!.attributes('data-status')).toBe('ready')
    await buttons[0]!.trigger('click')
    expect(onGoToPage).toHaveBeenCalledWith(1)
    wrapper.unmount()
  })

  it('shows empty and error states', async () => {
    const empty = mount(ThumbnailsPanel, {
      props: {
        pageCount: 0,
        pageNumber: 1,
        ready: true,
        getPage: vi.fn(),
        onGoToPage: vi.fn(),
      },
    })
    expect(empty.text()).toContain('No pages')
    empty.unmount()

    const getPage = vi.fn(async () => undefined)
    const wrapper = mount(ThumbnailsPanel, {
      props: {
        pageCount: 1,
        pageNumber: 1,
        ready: true,
        getPage,
        onGoToPage: vi.fn(),
      },
    })
    await flushPromises()
    expect(wrapper.get('.vpdf-thumb').attributes('data-status')).toBe('error')
    expect(wrapper.text()).toContain('Preview unavailable')
    wrapper.unmount()
  })

  it('cancels in-flight renders when the document changes or the panel unmounts', async () => {
    const cancel = vi.fn()
    const { page } = mockPage({ cancel, delay: true })
    const getPage = vi.fn(async () => page)
    const wrapper = mount(ThumbnailsPanel, {
      props: {
        pageCount: 1,
        pageNumber: 1,
        ready: true,
        documentKey: 'first',
        getPage,
        onGoToPage: vi.fn(),
      },
    })
    await flushPromises()
    expect(page.render).toHaveBeenCalled()
    await wrapper.setProps({ documentKey: 'second' })
    expect(cancel).toHaveBeenCalled()
    wrapper.unmount()
    expect(cancel.mock.calls.length).toBeGreaterThanOrEqual(1)
  })

  it('does not fetch pages until the document is ready', async () => {
    const getPage = vi.fn(async () => mockPage().page)
    const wrapper = mount(ThumbnailsPanel, {
      props: {
        pageCount: 3,
        pageNumber: 1,
        ready: false,
        getPage,
        onGoToPage: vi.fn(),
      },
    })
    await flushPromises()
    expect(getPage).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  function thumbCols(wrapper: ReturnType<typeof mount>): string {
    return (wrapper.get('.vpdf-thumbnails').element as HTMLElement).style.getPropertyValue(
      '--vpdf-thumb-cols',
    )
  }

  it('resolves thumbnail columns to an integer >= 1 (default 2)', async () => {
    const base = {
      pageCount: 1,
      pageNumber: 1,
      ready: false,
      getPage: vi.fn(),
      onGoToPage: vi.fn(),
    }
    const omitted = mount(ThumbnailsPanel, { props: base })
    expect(thumbCols(omitted)).toBe('2')
    omitted.unmount()

    const invalid = mount(ThumbnailsPanel, { props: { ...base, columns: 0 } })
    expect(thumbCols(invalid)).toBe('2')
    await invalid.setProps({ columns: -1 })
    expect(thumbCols(invalid)).toBe('2')
    invalid.unmount()

    const one = mount(ThumbnailsPanel, { props: { ...base, columns: 1 } })
    expect(thumbCols(one)).toBe('1')
    one.unmount()

    const three = mount(ThumbnailsPanel, { props: { ...base, columns: 3 } })
    expect(thumbCols(three)).toBe('3')
    three.unmount()
  })

  it('scrolls the current thumbnail into view when the page changes', async () => {
    const scrollIntoView = vi.fn()
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: scrollIntoView,
    })
    try {
    const wrapper = mount(ThumbnailsPanel, {
      props: {
        pageCount: 3,
        pageNumber: 1,
        ready: false,
        getPage: vi.fn(),
        onGoToPage: vi.fn(),
      },
    })
    await flushPromises()
    const buttons = wrapper.findAll('.vpdf-thumb')
    expect(buttons).toHaveLength(3)
    scrollIntoView.mockClear()
    await wrapper.setProps({ pageNumber: 2 })
    await flushPromises()
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' })
    expect(
      scrollIntoView.mock.contexts.some(
        (el) => el instanceof HTMLElement && el.getAttribute('data-page') === '2',
      ),
    ).toBe(true)
    wrapper.unmount()
  } finally {
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  }
  })
})
