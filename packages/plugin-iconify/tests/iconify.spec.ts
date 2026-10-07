import { describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { mount } from '@vue/test-utils'
import VPdfToolbar from '../../vpdf/src/components/VPdfToolbar.vue'
import { PluginManager } from '../../vpdf/src/plugins/manager'
import { createBuiltinPlugins, VPDF_BUILTIN_PLUGIN_IDS } from '../../vpdf/src/plugins/builtins'
import { createInitialViewerState, DEFAULT_FEATURES, DEFAULT_TOOLBAR } from '../../vpdf/src/utils/defaults'
import { VPDF_VIEWER_KEY } from '../../vpdf/src/types/context'
import { VPDF_ICON_FALLBACKS } from '../../vpdf/src/icons'
import type { VPdfViewerApi } from '../../vpdf/src/composables/useVPdfViewer'
import type { VPdfViewerController, VPdfViewerOptions } from '../../vpdf/src/types'
import { createIconifyPlugin, LUCIDE_DEFAULT_ICONS, resolveFileIcon, VPDF_ICONIFY_PLUGIN_ID } from '../src/index'
import OutlinePanel from '../../vpdf/src/plugins/builtins/OutlinePanel.vue'
import AttachmentsPanel from '../../vpdf/src/plugins/builtins/AttachmentsPanel.vue'
import VPdfAnnotationEditor from '../../vpdf/src/components/VPdfAnnotationEditor.vue'

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

function createApi(
  manager: PluginManager,
  state: ReturnType<typeof ref>,
  controller: VPdfViewerController,
) {
  return {
    resolvedToolbar: computed(() => ({ ...DEFAULT_TOOLBAR })),
    resolvedFeatures: computed(() => ({ ...DEFAULT_FEATURES })),
    state,
    controller,
    plugins: manager,
  } as unknown as VPdfViewerApi
}

function mountToolbar(manager: PluginManager, state: ReturnType<typeof ref>, controller: VPdfViewerController) {
  const api = createApi(manager, state, controller)
  return mount(VPdfToolbar, {
    props: { api },
    global: {
      provide: {
        [VPDF_VIEWER_KEY as symbol]: {
          state,
          options: ref({}),
          controller,
          plugins: manager,
          pluginContext: undefined as never,
        },
      },
    },
  })
}

describe('createIconifyPlugin', () => {
  it('renders bundled Lucide SVGs for default toolbar slots', async () => {
    const state = ref({ ...createInitialViewerState(), pageCount: 4, loadState: 'ready' as const })
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [...createBuiltinPlugins(), createIconifyPlugin()],
    })
    await vi.waitFor(() => expect(manager.iconRendererView.value).toBeTruthy())

    const wrapper = mountToolbar(manager, state, controller)
    const search = wrapper.get('[aria-label="Search"]')
    expect(search.find('svg').exists()).toBe(true)
    expect(search.html()).toContain('circle')
    expect(search.text()).not.toContain(VPDF_ICON_FALLBACKS.search)

    await wrapper.get('[aria-label="More actions"]').trigger('click')
    const properties = wrapper
      .findAll('button[role="menuitem"]')
      .find((button) => button.text().includes('Properties'))
    expect(properties).toBeDefined()
    expect(LUCIDE_DEFAULT_ICONS.properties.name).toBe('info')
    expect(properties!.find('svg').exists()).toBe(true)
    expect(properties!.html()).toContain('r="10"')
    expect(properties!.html()).not.toContain('M3 1.25C1.89543')
    wrapper.unmount()
  })

  it('replaces a slot with a custom icon override', async () => {
    const state = ref({ ...createInitialViewerState(), pageCount: 4, loadState: 'ready' as const })
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [
        ...createBuiltinPlugins(),
        createIconifyPlugin({
          icons: {
            search: {
              body: LUCIDE_DEFAULT_ICONS.print.body,
              width: 24,
              height: 24,
            },
          },
        }),
      ],
    })
    await vi.waitFor(() => expect(manager.iconRendererView.value).toBeTruthy())

    const wrapper = mountToolbar(manager, state, controller)
    const html = wrapper.get('[aria-label="Search"]').html()
    expect(html).toContain('M6 18H4a2')
    expect(html).not.toContain('m21 21l-4.34-4.34')
    wrapper.unmount()
  })

  it('renders the bundled Lucide trash icon for editorDelete', async () => {
    expect(LUCIDE_DEFAULT_ICONS.editorDelete.name).toBe('trash-2')
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [createIconifyPlugin()],
    })
    await vi.waitFor(() => expect(manager.iconRendererView.value).toBeTruthy())

    const wrapper = mount(VPdfAnnotationEditor, {
      props: {
        editorType: 'stamp',
        params: {},
        canDelete: true,
        actions: { update: vi.fn(), deleteSelected: vi.fn() },
      },
      global: {
        provide: {
          [VPDF_VIEWER_KEY as symbol]: {
            state,
            options,
            controller,
            plugins: manager,
            pluginContext: undefined as never,
          },
        },
      },
    })
    const button = wrapper.get('[aria-label="Delete annotation"]')
    expect(button.find('svg').exists()).toBe(true)
    expect(button.html()).toContain('M10 11v6')
    expect(button.text()).not.toContain(VPDF_ICON_FALLBACKS.editorDelete)
    wrapper.unmount()
  })

  it('replaces editorDelete with a custom icon override', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [
        createIconifyPlugin({
          icons: {
            editorDelete: {
              body: LUCIDE_DEFAULT_ICONS.print.body,
              width: 24,
              height: 24,
            },
          },
        }),
      ],
    })
    await vi.waitFor(() => expect(manager.iconRendererView.value).toBeTruthy())

    const wrapper = mount(VPdfAnnotationEditor, {
      props: {
        editorType: 'stamp',
        params: {},
        canDelete: true,
        actions: { update: vi.fn(), deleteSelected: vi.fn() },
      },
      global: {
        provide: {
          [VPDF_VIEWER_KEY as symbol]: {
            state,
            options,
            controller,
            plugins: manager,
            pluginContext: undefined as never,
          },
        },
      },
    })
    const html = wrapper.get('[aria-label="Delete annotation"]').html()
    expect(html).toContain('M6 18H4a2')
    expect(html).not.toContain('M10 11v6')
    wrapper.unmount()
  })

  it('keeps icon renderers isolated per PluginManager', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const withIcons = new PluginManager(state, options, controller)
    const withoutIcons = new PluginManager(state, options, controller)
    withIcons.register(createIconifyPlugin())
    await vi.waitFor(() => expect(withIcons.iconRendererView.value).toBeTruthy())
    expect(withoutIcons.iconRendererView.value).toBeUndefined()
  })

  it('restores glyph fallbacks when the plugin is disabled', async () => {
    const state = ref({ ...createInitialViewerState(), pageCount: 4, loadState: 'ready' as const })
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [...createBuiltinPlugins(), createIconifyPlugin()],
    })
    await vi.waitFor(() => expect(manager.iconRendererView.value).toBeTruthy())

    const wrapper = mountToolbar(manager, state, controller)
    expect(wrapper.get('[aria-label="Search"]').find('svg').exists()).toBe(true)

    manager.setEnabled(VPDF_ICONIFY_PLUGIN_ID, false)
    await wrapper.vm.$nextTick()
    expect(manager.iconRendererView.value).toBeUndefined()
    const searchAfter = wrapper.get('[aria-label="Search"]')
    expect(searchAfter.find('svg').exists()).toBe(true)
    expect(searchAfter.html()).toContain('M10.089 10.973')
    wrapper.unmount()
  })

  it('renders custom outline expand and collapse icons', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [
        createIconifyPlugin({
          icons: {
            outlineExpand: {
              body: '<path d="M1 2h4"/>',
              width: 24,
              height: 24,
            },
            outlineCollapse: {
              body: LUCIDE_DEFAULT_ICONS.print.body,
              width: 24,
              height: 24,
            },
          },
        }),
      ],
    })
    await vi.waitFor(() => expect(manager.iconRendererView.value).toBeTruthy())

    const wrapper = mount(OutlinePanel, {
      props: {
        onSelect: vi.fn(),
        items: [
          {
            title: 'Chapter',
            dest: 'chapter',
            count: 1,
            items: [{ title: 'Section', dest: 'section', items: [] }],
          },
          {
            title: 'Collapsed',
            dest: 'collapsed',
            count: -1,
            items: [{ title: 'Hidden', dest: 'hidden', items: [] }],
          },
        ],
      },
      global: {
        provide: {
          [VPDF_VIEWER_KEY as symbol]: {
            state,
            options,
            controller,
            plugins: manager,
            pluginContext: undefined as never,
          },
        },
      },
    })

    const [collapse, expand] = wrapper.findAll('.vpdf-outline-toggle')
    expect(collapse!.html()).toContain('M6 18H4a2')
    expect(expand!.html()).toContain('M1 2h4')
    wrapper.unmount()
  })

  it('keeps accessible labels and click actions', async () => {
    const state = ref({ ...createInitialViewerState(), pageCount: 4, loadState: 'ready' as const })
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [...createBuiltinPlugins(), createIconifyPlugin()],
    })
    await vi.waitFor(() => expect(manager.iconRendererView.value).toBeTruthy())

    const wrapper = mountToolbar(manager, state, controller)
    const rotate = wrapper.get('[aria-label="Rotate clockwise"]')
    expect(rotate.find('svg').exists()).toBe(true)
    await rotate.trigger('click')
    expect(controller.rotate).toHaveBeenCalledWith(90)
    manager.setEnabled(VPDF_BUILTIN_PLUGIN_IDS.search, false)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[aria-label="Search"]').exists()).toBe(false)
    wrapper.unmount()
  })

  function mountAttachments(
    manager: PluginManager,
    state: ReturnType<typeof ref>,
    controller: VPdfViewerController,
  ) {
    return mount(AttachmentsPanel, {
      props: {
        onDownload: vi.fn(),
        attachments: [
          { id: '1', filename: 'report.pdf', size: 2048 },
          { id: '2', filename: 'sheet.xlsx' },
          { id: '3', filename: 'photo.png' },
          { id: '4', filename: 'notes' },
        ],
      },
      global: {
        provide: {
          [VPDF_VIEWER_KEY as symbol]: {
            state,
            options: ref({}),
            controller,
            plugins: manager,
            pluginContext: undefined as never,
          },
        },
      },
    })
  }

  it('renders bundled file-type icons with category classes', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [createIconifyPlugin()],
    })
    await vi.waitFor(() => expect(manager.iconRendererView.value).toBeTruthy())

    const wrapper = mountAttachments(manager, state, controller)
    expect(wrapper.find('.vpdf-file-icon--pdf').exists()).toBe(true)
    expect(wrapper.find('.vpdf-file-icon--spreadsheet').exists()).toBe(true)
    expect(wrapper.find('.vpdf-file-icon--image').exists()).toBe(true)
    expect(wrapper.find('.vpdf-file-icon--generic').exists()).toBe(true)
    const svgs = wrapper.findAll('.vpdf-attachment svg')
    expect(svgs).toHaveLength(4)
    expect(new Set(svgs.map((svg) => svg.html())).size).toBe(4)
    wrapper.unmount()
  })

  it('maps file slots to vscode-icons by extension', () => {
    expect(resolveFileIcon('file:js')?.icon.name).toBe('file-type-js')
    expect(resolveFileIcon('file:ts')?.icon.name).toBe('file-type-typescript')
    expect(resolveFileIcon('file:unknown')?.icon.name).toBe('default-file')
    expect(resolveFileIcon('file:generic')?.icon.name).toBe('default-file')
  })

  it('skips file icons when fileIcons is false', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [createIconifyPlugin({ fileIcons: false })],
    })
    await vi.waitFor(() => expect(manager.iconRendererView.value).toBeTruthy())

    const wrapper = mountAttachments(manager, state, controller)
    expect(wrapper.find('.vpdf-file-icon').exists()).toBe(false)
    expect(wrapper.find('.vpdf-attachment svg').exists()).toBe(false)
    wrapper.unmount()
  })

  it('applies a custom file:pdf icon override without category classes', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [
        createIconifyPlugin({
          icons: {
            'file:pdf': {
              body: LUCIDE_DEFAULT_ICONS.print.body,
              width: 24,
              height: 24,
            },
          },
        }),
      ],
    })
    await vi.waitFor(() => expect(manager.iconRendererView.value).toBeTruthy())

    const wrapper = mountAttachments(manager, state, controller)
    const pdfRow = wrapper.findAll('.vpdf-attachment')[0]!
    expect(pdfRow.html()).toContain('M6 18H4a2')
    expect(pdfRow.find('.vpdf-file-icon--pdf').exists()).toBe(false)
    wrapper.unmount()
  })

  it('falls back when a string icon name is not in local storage', async () => {
    const state = ref({ ...createInitialViewerState(), pageCount: 4, loadState: 'ready' as const })
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [
        ...createBuiltinPlugins(),
        createIconifyPlugin({
          icons: { search: 'mdi:magnify' },
        }),
      ],
    })
    await vi.waitFor(() => expect(manager.iconRendererView.value).toBeTruthy())

    const wrapper = mountToolbar(manager, state, controller)
    const search = wrapper.get('[aria-label="Search"]')
    expect(search.find('svg').exists()).toBe(false)
    expect(search.text()).toContain(VPDF_ICON_FALLBACKS.search)
    wrapper.unmount()
  })

  it('renders a string slot name from iconify.collections', async () => {
    const state = ref({ ...createInitialViewerState(), pageCount: 4, loadState: 'ready' as const })
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [
        ...createBuiltinPlugins(),
        createIconifyPlugin({
          icons: { search: 'custom:magnify' },
          iconify: {
            collections: [
              {
                prefix: 'custom',
                icons: {
                  magnify: {
                    body: '<path d="M1 2h4"/>',
                    width: 24,
                    height: 24,
                  },
                },
              },
            ],
          },
        }),
      ],
    })
    await vi.waitFor(() => expect(manager.iconRendererView.value).toBeTruthy())

    const wrapper = mountToolbar(manager, state, controller)
    expect(wrapper.get('[aria-label="Search"]').html()).toContain('M1 2h4')
    wrapper.unmount()
  })

  it('renders a string slot name from iconify.icons', async () => {
    const state = ref({ ...createInitialViewerState(), pageCount: 4, loadState: 'ready' as const })
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: [
        ...createBuiltinPlugins(),
        createIconifyPlugin({
          icons: { search: 'custom:foo' },
          iconify: {
            icons: {
              'custom:foo': {
                body: '<path d="M3 3h2"/>',
                width: 24,
                height: 24,
              },
            },
          },
        }),
      ],
    })
    await vi.waitFor(() => expect(manager.iconRendererView.value).toBeTruthy())

    const wrapper = mountToolbar(manager, state, controller)
    expect(wrapper.get('[aria-label="Search"]').html()).toContain('M3 3h2')
    wrapper.unmount()
  })
})
