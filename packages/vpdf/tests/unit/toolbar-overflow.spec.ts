import { describe, expect, it } from 'vitest'
import { TOOLBAR_OVERFLOW_MAX, toolbarItemOverflows } from '../../src/utils/toolbarOverflow'

describe('toolbarItemOverflows', () => {
  it('keeps start items on the bar at every width', () => {
    expect(toolbarItemOverflows({ id: 'vpdf.navigation:sidebar', placement: 'start' }, 320)).toBe(false)
    expect(toolbarItemOverflows({ id: 'vpdf.navigation:page-nav', placement: 'start' }, 320)).toBe(false)
  })

  it('always treats explicit overflow placement as overflowed', () => {
    expect(toolbarItemOverflows({ id: 'more', placement: 'overflow' }, 2000)).toBe(true)
  })

  it('moves annotation tools at 1024px', () => {
    const highlight = { id: 'vpdf.annotations:highlight', placement: 'annotations' as const }
    expect(toolbarItemOverflows(highlight, TOOLBAR_OVERFLOW_MAX.annotations + 1)).toBe(false)
    expect(toolbarItemOverflows(highlight, TOOLBAR_OVERFLOW_MAX.annotations)).toBe(true)
  })

  it('keeps Search until 720px while other end items overflow at 880px', () => {
    const search = { id: 'vpdf.search:toggle', placement: 'end' as const }
    const download = { id: 'vpdf.download:download', placement: 'end' as const }
    expect(toolbarItemOverflows(search, TOOLBAR_OVERFLOW_MAX.secondaryEnd)).toBe(false)
    expect(toolbarItemOverflows(download, TOOLBAR_OVERFLOW_MAX.secondaryEnd)).toBe(true)
    expect(toolbarItemOverflows(search, TOOLBAR_OVERFLOW_MAX.tools)).toBe(true)
  })

  it('moves Zoom last among center items', () => {
    const zoom = { id: 'vpdf.zoom:zoom', placement: 'center' as const }
    const rotate = { id: 'vpdf.rotate:rotate', placement: 'center' as const }
    expect(toolbarItemOverflows(rotate, TOOLBAR_OVERFLOW_MAX.tools)).toBe(true)
    expect(toolbarItemOverflows(zoom, TOOLBAR_OVERFLOW_MAX.tools)).toBe(false)
    expect(toolbarItemOverflows(zoom, TOOLBAR_OVERFLOW_MAX.zoom)).toBe(true)
  })
})
