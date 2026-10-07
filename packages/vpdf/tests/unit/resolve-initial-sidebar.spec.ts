import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  resolveInitialSidebar,
  SIDEBAR_OVERLAY_MAX_PX,
} from '../../src/utils/defaults'

function stubMatchMedia(minWidthMatches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes(`min-width: ${SIDEBAR_OVERLAY_MAX_PX + 1}px`)
        ? minWidthMatches
        : !minWidthMatches,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false
      },
    })),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('resolveInitialSidebar', () => {
  it('opens thumbnails when the viewport is wider than the overlay ceiling', () => {
    stubMatchMedia(true)
    expect(resolveInitialSidebar()).toBe('thumbnails')
  })

  it('stays closed at the overlay ceiling and below', () => {
    stubMatchMedia(false)
    expect(resolveInitialSidebar()).toBe('none')
  })

  it('honors an explicit panel regardless of viewport', () => {
    stubMatchMedia(true)
    expect(resolveInitialSidebar('none')).toBe('none')
    stubMatchMedia(false)
    expect(resolveInitialSidebar('outline')).toBe('outline')
  })
})
