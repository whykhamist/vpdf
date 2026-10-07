import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import VPdfViewer from '../../src/components/VPdfViewer.vue'
import {
  applyDestinationScrollOffset,
  resolveDestinationOffset,
  resolveNonNegativePx,
  resolvePageGap,
  resolvePageRadius,
  scaleChromePx,
} from '../../src/utils/pageChrome'

vi.mock('../../src/engine/PdfEngine', () => ({
  PdfEngine: class {
    async mount() {}
    async destroy() {}
    async load() {}
    async closeDocument() {}
  },
}))

describe('resolveNonNegativePx', () => {
  it('returns finite values >= 0', () => {
    expect(resolveNonNegativePx(0)).toBe(0)
    expect(resolveNonNegativePx(24)).toBe(24)
    expect(resolveNonNegativePx('8')).toBe(8)
  })

  it('treats invalid and negative values as unset', () => {
    expect(resolveNonNegativePx(undefined)).toBeUndefined()
    expect(resolveNonNegativePx(-1)).toBeUndefined()
    expect(resolveNonNegativePx(Number.NaN)).toBeUndefined()
    expect(resolveNonNegativePx(Infinity)).toBeUndefined()
  })
})

describe('scaleChromePx', () => {
  it('multiplies by a finite positive scale', () => {
    expect(scaleChromePx(10, 2)).toBe(20)
    expect(scaleChromePx(10, 0.5)).toBe(5)
  })

  it('leaves px unchanged when scale is omitted or invalid', () => {
    expect(scaleChromePx(10, undefined)).toBe(10)
    expect(scaleChromePx(10, 0)).toBe(10)
    expect(scaleChromePx(10, -1)).toBe(10)
    expect(scaleChromePx(10, Number.NaN)).toBe(10)
  })
})

describe('resolvePageGap', () => {
  it('defaults to 10 when omitted or invalid', () => {
    expect(resolvePageGap(undefined)).toBe(10)
    expect(resolvePageGap(-1)).toBe(10)
    expect(resolvePageGap(Number.NaN)).toBe(10)
  })

  it('keeps explicit 0 and positive values', () => {
    expect(resolvePageGap(0)).toBe(0)
    expect(resolvePageGap(24)).toBe(24)
  })

  it('scales with viewer scale', () => {
    expect(resolvePageGap(10, 2)).toBe(20)
    expect(resolvePageGap(10, 0.5)).toBe(5)
    expect(resolvePageGap(0, 2)).toBe(0)
    expect(resolvePageGap(undefined, 2)).toBe(20)
    expect(resolvePageGap(10, undefined)).toBe(10)
  })
})

describe('resolvePageRadius', () => {
  it('defaults to 10 when omitted or invalid', () => {
    expect(resolvePageRadius(undefined)).toBe(10)
    expect(resolvePageRadius(-4)).toBe(10)
    expect(resolvePageRadius(Number.NaN)).toBe(10)
  })

  it('treats 0 as square (unset)', () => {
    expect(resolvePageRadius(0)).toBeUndefined()
  })

  it('keeps a positive radius', () => {
    expect(resolvePageRadius(8)).toBe(8)
  })

  it('scales with viewer scale', () => {
    expect(resolvePageRadius(10, 2)).toBe(20)
    expect(resolvePageRadius(10, 0.5)).toBe(5)
    expect(resolvePageRadius(0, 2)).toBeUndefined()
    expect(resolvePageRadius(undefined, 2)).toBe(20)
    expect(resolvePageRadius(8, undefined)).toBe(8)
  })
})

describe('resolveDestinationOffset', () => {
  it('defaults to 20 when omitted or invalid', () => {
    expect(resolveDestinationOffset(undefined)).toBe(20)
    expect(resolveDestinationOffset(-20)).toBe(20)
    expect(resolveDestinationOffset(Number.NaN)).toBe(20)
  })

  it('keeps explicit 0 and positive values', () => {
    expect(resolveDestinationOffset(0)).toBe(0)
    expect(resolveDestinationOffset(40)).toBe(40)
  })

  it('scales with viewer scale', () => {
    expect(resolveDestinationOffset(20, 2)).toBe(40)
    expect(resolveDestinationOffset(20, 0.5)).toBe(10)
    expect(resolveDestinationOffset(0, 2)).toBe(0)
    expect(resolveDestinationOffset(undefined, 2)).toBe(40)
    expect(resolveDestinationOffset(20, undefined)).toBe(20)
  })
})

describe('applyDestinationScrollOffset', () => {
  it('leaves scrollTop unchanged when offset is omitted or 0', () => {
    expect(applyDestinationScrollOffset(120, undefined)).toBe(120)
    expect(applyDestinationScrollOffset(120, 0)).toBe(120)
  })

  it('subtracts a positive offset', () => {
    expect(applyDestinationScrollOffset(120, 40)).toBe(80)
  })

  it('ignores negative and invalid offsets', () => {
    expect(applyDestinationScrollOffset(120, -20)).toBe(120)
    expect(applyDestinationScrollOffset(120, Number.NaN)).toBe(120)
  })

  it('clamps at the document start', () => {
    expect(applyDestinationScrollOffset(10, 40)).toBe(0)
    expect(applyDestinationScrollOffset(0, 16)).toBe(0)
  })
})

describe('VPdfViewer page chrome options', () => {
  let wrapper: VueWrapper | undefined

  afterEach(async () => {
    wrapper?.unmount()
    wrapper = undefined
  })

  function rootEl() {
    return wrapper!.find('.vpdf-root').element as HTMLElement
  }

  it('applies default page chrome vars when options are omitted', async () => {
    wrapper = mount(VPdfViewer, { props: { options: {} } })
    await flushPromises()
    const root = wrapper.find('.vpdf-root')
    expect(root.classes()).toContain('vpdf-has-page-gap')
    expect(root.classes()).toContain('vpdf-has-page-radius')
    expect(rootEl().style.getPropertyValue('--vpdf-page-gap')).toBe('10px')
    expect(rootEl().style.getPropertyValue('--vpdf-page-radius')).toBe('10px')
  })

  it('binds pageGap and pageRadius as CSS variables', async () => {
    wrapper = mount(VPdfViewer, {
      props: { options: { pageGap: 24, pageRadius: 8 } },
    })
    await flushPromises()
    const root = wrapper.find('.vpdf-root')
    expect(root.classes()).toContain('vpdf-has-page-gap')
    expect(root.classes()).toContain('vpdf-has-page-radius')
    expect(rootEl().style.getPropertyValue('--vpdf-page-gap')).toBe('24px')
    expect(rootEl().style.getPropertyValue('--vpdf-page-radius')).toBe('8px')
  })

  it('treats pageRadius 0 as square (no radius var)', async () => {
    wrapper = mount(VPdfViewer, {
      props: { options: { pageRadius: 0, pageGap: 0 } },
    })
    await flushPromises()
    const root = wrapper.find('.vpdf-root')
    expect(root.classes()).toContain('vpdf-has-page-gap')
    expect(root.classes()).not.toContain('vpdf-has-page-radius')
    expect(rootEl().style.getPropertyValue('--vpdf-page-gap')).toBe('0px')
    expect(rootEl().style.getPropertyValue('--vpdf-page-radius')).toBe('')
  })
})
