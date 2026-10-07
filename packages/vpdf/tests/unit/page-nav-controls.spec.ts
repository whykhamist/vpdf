import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PageNavControls from '../../src/plugins/builtins/PageNavControls.vue'

function mountPager(overrides?: { pageNumber?: number; pageCount?: number }) {
  const onPrevious = vi.fn()
  const onNext = vi.fn()
  const onGoToPage = vi.fn()
  const wrapper = mount(PageNavControls, {
    props: {
      pageNumber: overrides?.pageNumber ?? 2,
      pageCount: overrides?.pageCount ?? 8,
      onPrevious,
      onNext,
      onGoToPage,
    },
  })
  return { wrapper, onPrevious, onNext, onGoToPage }
}

describe('PageNavControls', () => {
  it('commits a valid page and reverts invalid input', async () => {
    const { wrapper, onGoToPage } = mountPager()
    const input = wrapper.get('input')

    await input.setValue('5')
    expect(onGoToPage).toHaveBeenCalledWith(5)

    onGoToPage.mockClear()
    await input.setValue('99')
    expect(onGoToPage).not.toHaveBeenCalled()
    expect((input.element as HTMLInputElement).value).toBe('2')

    await input.setValue('1.5')
    expect(onGoToPage).not.toHaveBeenCalled()
    expect((input.element as HTMLInputElement).value).toBe('2')

    wrapper.unmount()
  })

  it('disables the input when there is no document', () => {
    const { wrapper } = mountPager({ pageNumber: 1, pageCount: 0 })
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })
})
