import { describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, markRaw, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import {
  VPdfButton,
  VPdfCard,
  VPdfCheckbox,
  VPdfDropdownMenu,
  VPdfInput,
  VPdfSelect,
} from '../../src/components/ui'
import ButtonDefault from '../../src/components/ui/defaults/Button.vue'
import { VPDF_UI_HOST_KEY } from '../../src/composables/uiDefaults'
import { PluginManager } from '../../src/plugins/manager'
import { VPDF_VIEWER_KEY } from '../../src/types/context'
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

describe('UI primitives', () => {
  it('binds input, select, checkbox, and button variants', async () => {
    const onInput = vi.fn()
    const input = mount(VPdfInput, {
      props: { modelValue: 'a', invalid: true, 'onUpdate:modelValue': onInput },
    })
    expect(input.get('input').attributes('aria-invalid')).toBe('true')
    await input.get('input').setValue('b')
    expect(onInput).toHaveBeenCalledWith('b')

    const onSelect = vi.fn()
    const select = mount(VPdfSelect, {
      props: { modelValue: 'one', 'onUpdate:modelValue': onSelect },
      slots: { default: () => [h('option', { value: 'one' }, 'One'), h('option', { value: 'two' }, 'Two')] },
    })
    await select.get('select').setValue('two')
    expect(onSelect).toHaveBeenCalledWith('two')

    const onCheck = vi.fn()
    const checkbox = mount(VPdfCheckbox, {
      props: { modelValue: false, label: 'On', 'onUpdate:modelValue': onCheck },
    })
    await checkbox.get('input[type="checkbox"]').setValue(true)
    expect(onCheck).toHaveBeenCalledWith(true)

    expect(mount(ButtonDefault, { props: { variant: 'solid' } }).classes()).toContain('vpdf-btn-primary')
    expect(mount(ButtonDefault, { props: { variant: 'outline' } }).classes()).toContain('vpdf-btn-ghost')
  })

  it('opens and closes a dropdown from outside click', async () => {
    const wrapper = mount(VPdfDropdownMenu, {
      slots: {
        default: ({ toggle }: { toggle: () => void }) =>
          h('button', { type: 'button', onClick: toggle }, 'Open'),
        content: () => h('div', { id: 'menu' }, 'Inside'),
      },
      attachTo: document.body,
    })
    await wrapper.get('button').trigger('click')
    expect(wrapper.find('#menu').exists()).toBe(true)
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#menu').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders card title and footer', () => {
    const wrapper = mount(VPdfCard, {
      props: { title: 'Hello' },
      slots: { footer: () => h('button', { type: 'button' }, 'Ok') },
    })
    expect(wrapper.get('.vpdf-card-title').text()).toBe('Hello')
    expect(wrapper.get('.vpdf-card-footer').text()).toBe('Ok')
  })
})

describe('UI replacement', () => {
  it('uses defaults outside a viewer', () => {
    const wrapper = mount(VPdfButton, { slots: { default: () => 'Go' } })
    expect(wrapper.get('button.vpdf-btn').text()).toBe('Go')
  })

  it('lets a plugin replace a slot and a host ui prop win last', async () => {
    const PluginBtn = defineComponent({
      setup: () => () => h('button', { type: 'button', 'data-ui': 'plugin' }, 'Plugin'),
    })
    const HostBtn = defineComponent({
      setup: () => () => h('button', { type: 'button', 'data-ui': 'host' }, 'Host'),
    })
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const manager = new PluginManager(state, options, createMockController())
    let dispose = () => {}
    manager.register({
      id: 'theme',
      setup(ctx) {
        dispose = ctx.registerUiComponent('button', markRaw(PluginBtn))
      },
    })
    await vi.waitFor(() => expect(manager.uiView.value.button).toBeTruthy())

    const pluginOnly = mount(VPdfButton, {
      global: {
        provide: {
          [VPDF_VIEWER_KEY as symbol]: { plugins: manager },
        },
      },
    })
    expect(pluginOnly.find('[data-ui="plugin"]').exists()).toBe(true)
    pluginOnly.unmount()

    const hostWins = mount(VPdfButton, {
      global: {
        provide: {
          [VPDF_VIEWER_KEY as symbol]: { plugins: manager },
          [VPDF_UI_HOST_KEY as symbol]: computed(() => ({ button: markRaw(HostBtn) })),
        },
      },
    })
    expect(hostWins.find('[data-ui="host"]').exists()).toBe(true)
    hostWins.unmount()

    dispose()
    await flushPromises()
    const restored = mount(VPdfButton, {
      global: {
        provide: {
          [VPDF_VIEWER_KEY as symbol]: { plugins: manager },
        },
      },
    })
    expect(restored.find('button.vpdf-btn').exists()).toBe(true)
    restored.unmount()
    manager.dispose()
  })
})
