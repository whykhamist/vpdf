import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OutlinePanel from '../../src/plugins/builtins/OutlinePanel.vue'
import type { VPdfOutlineItem } from '../../src/types'

function item(
  title: string,
  options?: Partial<VPdfOutlineItem> & { items?: VPdfOutlineItem[] },
): VPdfOutlineItem {
  return {
    title,
    dest: options?.dest ?? title,
    items: options?.items ?? [],
    ...options,
  }
}

describe('OutlinePanel', () => {
  it('shows an empty state when there are no bookmarks', () => {
    const wrapper = mount(OutlinePanel, {
      props: { items: [], onSelect: vi.fn() },
    })
    expect(wrapper.text()).toContain('No outline')
    expect(wrapper.find('.vpdf-outline-list').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders nested branches and initializes from PDF count', () => {
    const wrapper = mount(OutlinePanel, {
      props: {
        onSelect: vi.fn(),
        items: [
          item('Chapter 1', {
            count: 2,
            items: [item('Section 1.1'), item('Section 1.2')],
          }),
          item('Chapter 2', {
            count: -1,
            items: [item('Hidden')],
          }),
          item('Leaf'),
        ],
      },
    })

    const toggles = wrapper.findAll('.vpdf-outline-toggle')
    expect(toggles).toHaveLength(2)
    expect(toggles[0]!.attributes('aria-expanded')).toBe('true')
    expect(toggles[0]!.attributes('aria-label')).toBe('Collapse Chapter 1')
    expect(toggles[1]!.attributes('aria-expanded')).toBe('false')
    expect(toggles[1]!.attributes('aria-label')).toBe('Expand Chapter 2')
    expect(toggles[0]!.html()).toContain('M10 13l4-7H6z')
    expect(toggles[1]!.html()).toContain('M13 9L6 5v8z')

    const nested = wrapper.findAll('ul.vpdf-outline-list ul.vpdf-outline-list')
    expect(nested[0]!.attributes('hidden')).toBeUndefined()
    expect(nested[1]!.attributes('hidden')).toBe('')

    expect(wrapper.findAll('.vpdf-outline-toggle-spacer')).toHaveLength(4)
    expect(wrapper.findAll('.vpdf-outline-item').map((node) => node.text())).toEqual([
      'Chapter 1',
      'Section 1.1',
      'Section 1.2',
      'Chapter 2',
      'Hidden',
      'Leaf',
    ])
    wrapper.unmount()
  })

  it('expands unspecified counts and keeps leaf rows without a toggle', () => {
    const wrapper = mount(OutlinePanel, {
      props: {
        onSelect: vi.fn(),
        items: [
          item('Open by default', {
            items: [item('Child')],
          }),
        ],
      },
    })
    const toggle = wrapper.get('.vpdf-outline-toggle')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(toggle.attributes('aria-controls')).toBe(
      wrapper.get('ul.vpdf-outline-list ul.vpdf-outline-list').attributes('id'),
    )
    expect(wrapper.findAll('.vpdf-outline-toggle')).toHaveLength(1)
    expect(wrapper.findAll('.vpdf-outline-toggle-spacer')).toHaveLength(1)
    wrapper.unmount()
  })

  it('toggles branches independently without selecting them', async () => {
    const onSelect = vi.fn()
    const wrapper = mount(OutlinePanel, {
      props: {
        onSelect,
        items: [
          item('A', { items: [item('A1')] }),
          item('B', { items: [item('B1')] }),
        ],
      },
    })

    const [toggleA, toggleB] = wrapper.findAll('.vpdf-outline-toggle')
    await toggleA!.trigger('click')
    await toggleB!.trigger('click')
    await toggleB!.trigger('click')

    expect(toggleA!.attributes('aria-expanded')).toBe('false')
    expect(toggleB!.attributes('aria-expanded')).toBe('true')
    expect(onSelect).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('selects a destination from the title button, including collapsed parents', async () => {
    const onSelect = vi.fn()
    const collapsed = item('Collapsed', {
      count: -2,
      dest: 'dest-parent',
      items: [item('Child', { dest: 'dest-child' })],
    })
    const wrapper = mount(OutlinePanel, {
      props: { items: [collapsed], onSelect },
    })

    await wrapper.findAll('.vpdf-outline-item')[0]!.trigger('click')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(collapsed)
    wrapper.unmount()
  })
})
