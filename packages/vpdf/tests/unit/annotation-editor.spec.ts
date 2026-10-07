import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, markRaw, ref } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { PluginManager } from '../../src/plugins/manager'
import { createBuiltinPlugins, VpdfAnnotationsPlugin, VPDF_BUILTIN_PLUGIN_IDS } from '../../src/plugins/builtins'
import { mergeViewerPlugins, pluginItemProps } from '../../src/plugins/resolve'
import { createInitialViewerState } from '../../src/utils/defaults'
import {
  ANNOTATION_EDITOR_FONT_SIZE,
  ANNOTATION_EDITOR_HIGHLIGHT_THICKNESS,
  ANNOTATION_EDITOR_INK_THICKNESS,
  ANNOTATION_EDITOR_OPACITY,
  ANNOTATION_HIGHLIGHT_COLORS,
  annotationParamsFromPdfjs,
  colorInputValue,
  findVisibleAnnotationEditorToolbar,
  PDFJS_EDITOR_PARAMS,
  pdfjsCommandsForParams,
} from '../../src/utils/annotationEditor'
import VPdfAnnotationEditor from '../../src/components/VPdfAnnotationEditor.vue'
import VPdfAnnotationEditorHost from '../../src/components/VPdfAnnotationEditorHost.vue'
import VPdfAnnotationToolDropdown from '../../src/components/VPdfAnnotationToolDropdown.vue'
import type { VPdfAnnotationEditorActions, VPdfViewerController, VPdfViewerOptions } from '../../src/types'

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

function createActions(): VPdfAnnotationEditorActions {
  return {
    update: vi.fn(),
    deleteSelected: vi.fn(),
  }
}

describe('annotation editor mapping', () => {
  it('maps PDF.js parameter events into semantic values', () => {
    expect(
      annotationParamsFromPdfjs([
        [PDFJS_EDITOR_PARAMS.FREETEXT_COLOR, '#112233'],
        [PDFJS_EDITOR_PARAMS.FREETEXT_SIZE, 18],
      ]),
    ).toEqual({ color: '#112233', fontSize: 18 })
    expect(
      annotationParamsFromPdfjs([
        [PDFJS_EDITOR_PARAMS.INK_COLOR_AND_OPACITY, { color: '#abcdef', opacity: 0.4 }],
        [PDFJS_EDITOR_PARAMS.INK_THICKNESS, 3],
      ]),
    ).toEqual({ color: '#abcdef', opacity: 0.4, thickness: 3 })
  })

  it('delegates updates back as PDF.js param commands', () => {
    expect(pdfjsCommandsForParams('freetext', { color: '#fff', fontSize: 12, thickness: 2, opacity: 0.5 })).toEqual([
      { type: PDFJS_EDITOR_PARAMS.FREETEXT_COLOR, value: '#fff' },
      { type: PDFJS_EDITOR_PARAMS.FREETEXT_SIZE, value: 12 },
    ])
    expect(pdfjsCommandsForParams('ink', { color: '#000', thickness: 4, opacity: 0.2 })).toEqual([
      { type: PDFJS_EDITOR_PARAMS.INK_COLOR, value: '#000' },
      { type: PDFJS_EDITOR_PARAMS.INK_THICKNESS, value: 4 },
      { type: PDFJS_EDITOR_PARAMS.INK_OPACITY, value: 0.2 },
    ])
    expect(pdfjsCommandsForParams('highlight', { color: '#0f0', thickness: 8 })).toEqual([
      { type: PDFJS_EDITOR_PARAMS.HIGHLIGHT_COLOR, value: '#0f0' },
      { type: PDFJS_EDITOR_PARAMS.HIGHLIGHT_THICKNESS, value: 8 },
    ])
    expect(pdfjsCommandsForParams('stamp', { color: '#000' })).toEqual([])
  })

  it('normalizes color input values', () => {
    expect(colorInputValue('#abc')).toBe('#aabbcc')
    expect(colorInputValue('rgb(1,2,3)')).toBe('#000000')
  })
})

describe('mergeViewerPlugins', () => {
  it('replaces a builtin plugin with the same id instead of duplicating it', () => {
    const replacement = VpdfAnnotationsPlugin()
    const merged = mergeViewerPlugins(createBuiltinPlugins(), [replacement])
    const annotations = merged.filter((plugin) => plugin.id === VPDF_BUILTIN_PLUGIN_IDS.annotations)
    expect(annotations).toHaveLength(1)
    expect(annotations[0]).toBe(replacement)
  })
})

describe('VPdfAnnotationEditor', () => {
  it('shows a color picker and delete for free text', async () => {
    const actions = createActions()
    const wrapper = mount(VPdfAnnotationEditor, {
      props: {
        editorType: 'freetext',
        params: { color: '#112233', fontSize: 16 },
        canDelete: true,
        actions,
      },
    })

    expect(wrapper.get('[aria-label="Annotation editor"]')).toBeTruthy()
    expect(wrapper.find('[aria-label="Color"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Font size"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label="Highlight color"]').exists()).toBe(false)

    await wrapper.get('[aria-label="Color"]').setValue('#445566')
    expect(actions.update).toHaveBeenCalledWith({ color: '#445566' })
    await wrapper.get('[aria-label="Delete annotation"]').trigger('click')
    expect(actions.deleteSelected).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('shows highlight presets and delete, not sliders', async () => {
    const actions = createActions()
    const wrapper = mount(VPdfAnnotationEditor, {
      props: {
        editorType: 'highlight',
        params: { color: '#FFFF98', thickness: 12 },
        canDelete: true,
        actions,
      },
    })
    expect(wrapper.find('[aria-label="Highlight color"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Color"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label="Thickness"]').exists()).toBe(false)
    await wrapper.get('[aria-label="Pink"]').trigger('click')
    expect(actions.update).toHaveBeenCalledWith({ color: '#FFCBE6' })
    wrapper.unmount()
  })

  it('shows a color picker and delete for ink', () => {
    const wrapper = mount(VPdfAnnotationEditor, {
      props: {
        editorType: 'ink',
        params: { color: '#000000', thickness: 2, opacity: 0.5 },
        canDelete: true,
        actions: createActions(),
      },
    })
    expect(wrapper.find('[aria-label="Color"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Thickness"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label="Opacity"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label="Delete annotation"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('shows only delete for stamp', () => {
    const wrapper = mount(VPdfAnnotationEditor, {
      props: {
        editorType: 'stamp',
        params: {},
        canDelete: true,
        actions: createActions(),
      },
    })
    expect(wrapper.find('[aria-label="Color"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label="Highlight color"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label="Delete annotation"]').exists()).toBe(true)
    wrapper.unmount()
  })
})

describe('VPdfAnnotationToolDropdown', () => {
  it('opens with Firefox highlight presets and thickness range while active', async () => {
    const onToggle = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(VPdfAnnotationToolDropdown, {
      props: {
        mode: 'highlight',
        label: 'Highlight',
        title: 'Highlight',
        icon: 'highlight',
        active: true,
        params: { color: '#FFFF98', thickness: 12 },
        onToggle,
        onUpdate,
      },
    })
    const trigger = wrapper.get('[aria-label="Highlight"]')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('[aria-label="Highlight settings"]').isVisible()).toBe(true)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(ANNOTATION_HIGHLIGHT_COLORS.length)
    const thickness = wrapper.get('[aria-label="Thickness"]')
    expect(thickness.attributes('min')).toBe(String(ANNOTATION_EDITOR_HIGHLIGHT_THICKNESS.min))
    expect(thickness.attributes('max')).toBe(String(ANNOTATION_EDITOR_HIGHLIGHT_THICKNESS.max))
    await wrapper.get('[aria-label="Blue"]').trigger('click')
    expect(onUpdate).toHaveBeenCalledWith({ color: '#80EBFF' })
    await trigger.trigger('click')
    expect(onToggle).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('keeps the dropdown closed until the tool is active', () => {
    const wrapper = mount(VPdfAnnotationToolDropdown, {
      props: {
        mode: 'freetext',
        label: 'Free text',
        title: 'Free text',
        icon: 'freetext',
        active: false,
        params: {},
        onToggle: vi.fn(),
        onUpdate: vi.fn(),
      },
    })
    expect(wrapper.get('[aria-label="Free text"]').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[aria-label="Free text settings"]').isVisible()).toBe(false)
    wrapper.unmount()
  })

  it('shows free text color and size controls', () => {
    const wrapper = mount(VPdfAnnotationToolDropdown, {
      props: {
        mode: 'freetext',
        label: 'Free text',
        title: 'Free text',
        icon: 'freetext',
        active: true,
        params: { color: '#112233', fontSize: 18 },
        onToggle: vi.fn(),
        onUpdate: vi.fn(),
      },
    })
    const size = wrapper.get('[aria-label="Font size"]')
    expect(wrapper.find('[aria-label="Color"]').exists()).toBe(true)
    expect(size.attributes('min')).toBe(String(ANNOTATION_EDITOR_FONT_SIZE.min))
    expect(size.attributes('max')).toBe(String(ANNOTATION_EDITOR_FONT_SIZE.max))
    expect(wrapper.find('[aria-label="Thickness"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('shows draw color, thickness, and opacity controls', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VPdfAnnotationToolDropdown, {
      props: {
        mode: 'ink',
        label: 'Draw',
        title: 'Draw',
        icon: 'ink',
        active: true,
        params: { color: '#000000', thickness: 2, opacity: 0.5 },
        onToggle: vi.fn(),
        onUpdate,
      },
    })
    const thickness = wrapper.get('[aria-label="Thickness"]')
    const opacity = wrapper.get('[aria-label="Opacity"]')
    expect(wrapper.find('[aria-label="Color"]').exists()).toBe(true)
    expect(thickness.attributes('min')).toBe(String(ANNOTATION_EDITOR_INK_THICKNESS.min))
    expect(thickness.attributes('max')).toBe(String(ANNOTATION_EDITOR_INK_THICKNESS.max))
    expect(opacity.attributes('min')).toBe(String(ANNOTATION_EDITOR_OPACITY.min))
    expect(opacity.attributes('max')).toBe(String(ANNOTATION_EDITOR_OPACITY.max))
    await wrapper.get('[aria-label="Color"]').setValue('#abcdef')
    expect(onUpdate).toHaveBeenCalledWith({ color: '#abcdef' })
    wrapper.unmount()
  })
})

describe('VPdfAnnotationEditorHost', () => {
  let wrapper: VueWrapper | undefined

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.body.replaceChildren()
  })

  it('teleports into a visible PDF.js toolbar and cleans up', async () => {
    const container = document.createElement('div')
    const toolbar = document.createElement('div')
    toolbar.className = 'editToolbar'
    toolbar.append(Object.assign(document.createElement('div'), { className: 'buttons' }))
    container.append(toolbar)
    document.body.append(container)

    expect(findVisibleAnnotationEditorToolbar(container)).toBe(toolbar)

    const actions = createActions()
    wrapper = mount(VPdfAnnotationEditorHost, {
      props: {
        editorType: 'highlight',
        params: { color: '#ff0000' },
        canDelete: true,
        actions,
        container,
      },
      attachTo: document.body,
    })
    await flushPromises()

    expect(toolbar.querySelector('[aria-label="Annotation editor"]')).toBeTruthy()
    expect(toolbar.querySelector('[aria-label="Highlight color"]')).toBeTruthy()

    toolbar.classList.add('hidden')
    await vi.waitFor(() => {
      expect(toolbar.querySelector('[aria-label="Annotation editor"]')).toBeNull()
    })

    wrapper.unmount()
    wrapper = undefined
    expect(toolbar.querySelector('[aria-label="Annotation editor"]')).toBeNull()
  })
})

describe('VpdfAnnotationsPlugin', () => {
  it('registers the editor host and accepts a component override', async () => {
    const CustomEditor = markRaw(
      defineComponent({
        name: 'CustomEditor',
        setup() {
          return () => h('div', { 'aria-label': 'Custom annotation editor' }, 'custom')
        },
      }),
    )
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: mergeViewerPlugins(createBuiltinPlugins(), [
        VpdfAnnotationsPlugin({ editorComponent: CustomEditor }),
      ]),
    })

    await vi.waitFor(() => {
      expect(manager.controlsView.value.some((item) => item.id.includes('annotation-editor'))).toBe(true)
    })
    const control = manager.controlsView.value.find((item) => item.id.includes('annotation-editor'))
    expect(control?.region).toBe('page-overlay-host')
    expect(pluginItemProps(control!).editorComponent).toBe(CustomEditor)

    state.value.annotationEditor = {
      isEditing: true,
      hasSelection: true,
      editorType: 'ink',
      params: { color: '#000000' },
    }
    const next = pluginItemProps(control!)
    expect(next.canDelete).toBe(true)
    expect(next.editorType).toBe('ink')

    manager.dispose()
    expect(manager.controlsView.value).toEqual([])
  })

  it('registers mode-driven dropdowns for highlight, free text, and draw', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [VpdfAnnotationsPlugin()],
    })

    await vi.waitFor(() => {
      expect(manager.toolbarItemsView.value.some((item) => item.id.endsWith('highlight'))).toBe(true)
    })
    const items = manager.toolbarItemsView.value
    const highlight = items.find((item) => item.id.endsWith('highlight'))
    const freetext = items.find((item) => item.id.endsWith('freetext'))
    const ink = items.find((item) => item.id.endsWith('ink'))
    const stamp = items.find((item) => item.id.endsWith('stamp'))
    expect(highlight?.kind).toBe('control')
    expect(freetext?.kind).toBe('control')
    expect(ink?.kind).toBe('control')
    expect(stamp?.kind).not.toBe('control')
    if (highlight?.kind !== 'control' || freetext?.kind !== 'control') {
      throw new Error('expected annotation dropdowns')
    }

    state.value.annotationEditorMode = 'highlight'
    state.value.annotationEditor = {
      isEditing: true,
      hasSelection: true,
      editorType: 'highlight',
      params: { color: '#FFFF98' },
    }
    expect(pluginItemProps(highlight).active).toBe(true)
    expect(pluginItemProps(freetext).active).toBe(false)

    manager.dispose()
  })
})
