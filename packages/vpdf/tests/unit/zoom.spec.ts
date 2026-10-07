import { describe, expect, it } from 'vitest'
import {
  isFitPreset,
  isPresetPercentValue,
  parseScaleSelectValue,
  scaleSelectValue,
  ZOOM_PERCENT_PRESETS,
} from '../../src/utils/zoom'

describe('zoom helpers', () => {
  it('keeps fit presets selected instead of the resolved percent', () => {
    expect(scaleSelectValue(1.23, 'page-width')).toBe('page-width')
    expect(scaleSelectValue(0.8, 'page-fit')).toBe('page-fit')
    expect(scaleSelectValue(1.1, 'page-height')).toBe('page-height')
    expect(isFitPreset('auto')).toBe(false)
  })

  it('maps numeric zoom to the matching preset value', () => {
    expect(scaleSelectValue(1)).toBe('1')
    expect(scaleSelectValue(0.25)).toBe('0.25')
    expect(scaleSelectValue(8)).toBe('8')
    expect(isPresetPercentValue('1.25')).toBe(true)
    expect(isPresetPercentValue('1.1')).toBe(false)
  })

  it('uses a temporary percent value between presets', () => {
    expect(scaleSelectValue(1.1)).toBe('1.1')
    expect(ZOOM_PERCENT_PRESETS.includes(110 as never)).toBe(false)
  })

  it('parses select values into controller scale arguments', () => {
    expect(parseScaleSelectValue('page-fit')).toBe('page-fit')
    expect(parseScaleSelectValue('1.25')).toBe(1.25)
    expect(parseScaleSelectValue('9')).toBe(8)
    expect(parseScaleSelectValue('0')).toBe(1)
  })
})
