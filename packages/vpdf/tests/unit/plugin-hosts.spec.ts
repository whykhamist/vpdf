import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import VPdfToolbar from '../../src/components/VPdfToolbar.vue'
import VPdfSidebar from '../../src/components/VPdfSidebar.vue'
import VPdfPageOverlays from '../../src/components/VPdfPageOverlays.vue'
import { VPdfModal } from '../../src/components/ui'
import { PluginManager } from '../../src/plugins/manager'
import { createBuiltinPlugins, VPDF_BUILTIN_PLUGIN_IDS } from '../../src/plugins/builtins'
import { createInitialViewerState, DEFAULT_FEATURES, DEFAULT_TOOLBAR } from '../../src/utils/defaults'
import type { VPdfViewerApi } from '../../src/composables/useVPdfViewer'
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

function stubViewerWidth(width: number) {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe() {
        this.callback(
          [{ contentRect: { width } } as ResizeObserverEntry],
          this as unknown as ResizeObserver,
        )
      }
      unobserve() {}
      disconnect() {}
    },
  )
}

async function mountBuiltinToolbar(width: number) {
  stubViewerWidth(width)
  const state = ref({ ...createInitialViewerState(), pageCount: 4, loadState: 'ready' as const })
  const options = ref<VPdfViewerOptions>({})
  const controller = createMockController()
  const manager = new PluginManager(state, options, controller, {
    plugins: createBuiltinPlugins(),
  })
  await vi.waitFor(() => expect(manager.toolbarItemsView.value.length).toBeGreaterThan(5))
  const root = document.createElement('div')
  root.className = 'vpdf-root'
  document.body.append(root)
  const wrapper = mount(VPdfToolbar, {
    props: { api: createApi(manager, state, controller) },
    attachTo: root,
  })
  await wrapper.vm.$nextTick()
  return { wrapper, root, controller }
}

describe('plugin hosts', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })
  it('renders overflow toolbar and menu items', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller)
    const onMenu = vi.fn()
    manager.register({
      id: 'overflow',
      setup(ctx) {
        ctx.registerToolbarItem({
          id: 'more',
          label: 'Overflow action',
          placement: 'overflow',
          onClick: () => undefined,
        })
        ctx.registerMenuItem({
          id: 'menu',
          label: 'Menu action',
          onClick: onMenu,
        })
      },
    })
    await vi.waitFor(() => expect(manager.menuItemsView.value.length).toBe(1))
    const wrapper = mount(VPdfToolbar, { props: { api: createApi(manager, state, controller) } })
    const more = wrapper.get('[aria-label="More actions"]')
    await more.trigger('click')
    expect(wrapper.text()).toContain('Overflow action')
    const menuButtons = wrapper.findAll('button[role="menuitem"]')
    await menuButtons[menuButtons.length - 1]!.trigger('click')
    expect(onMenu).toHaveBeenCalled()
  })

  it('selects among multiple sidebar panels', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller)
    const PanelA = defineComponent({ setup: () => () => h('p', 'Panel A') })
    const PanelB = defineComponent({ setup: () => () => h('p', 'Panel B') })
    manager.register({
      id: 'panels',
      setup(ctx) {
        ctx.registerPanel({ id: 'a', label: 'Alpha', component: PanelA })
        ctx.registerPanel({ id: 'b', label: 'Beta', component: PanelB })
      },
    })
    await vi.waitFor(() => expect(manager.panelsView.value.length).toBe(2))
    state.value.sidebar = 'plugins'
    const wrapper = mount(VPdfSidebar, { props: { api: createApi(manager, state, controller) } })
    expect(wrapper.text()).toContain('Panel A')
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    expect(controller.setSidebar).toHaveBeenCalledWith('plugins')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Panel B')
  })

  it('closes the overlay sidebar from backdrop click and Escape', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller)
    const PanelA = defineComponent({ setup: () => () => h('p', 'Panel A') })
    manager.register({
      id: 'panels',
      setup(ctx) {
        ctx.registerPanel({ id: 'a', label: 'Alpha', component: PanelA })
      },
    })
    await vi.waitFor(() => expect(manager.panelsView.value.length).toBe(1))
    state.value.sidebar = 'plugins'
    const wrapper = mount(VPdfSidebar, { props: { api: createApi(manager, state, controller) } })

    await wrapper.get('.vpdf-sidebar-backdrop').trigger('click')
    expect(controller.setSidebar).toHaveBeenCalledWith('none')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(controller.setSidebar).toHaveBeenCalledTimes(2)
    expect(controller.setSidebar).toHaveBeenLastCalledWith('none')
  })

  it('keeps the sidebar closed by default', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller)
    const PanelA = defineComponent({ setup: () => () => h('p', 'Panel A') })
    manager.register({
      id: 'panels',
      setup(ctx) {
        ctx.registerPanel({ id: 'a', label: 'Alpha', component: PanelA })
      },
    })
    await vi.waitFor(() => expect(manager.panelsView.value.length).toBe(1))
    const wrapper = mount(VPdfSidebar, { props: { api: createApi(manager, state, controller) } })
    expect(state.value.sidebar).toBe('none')
    expect(wrapper.find('.vpdf-sidebar').exists()).toBe(false)
  })

  it('teleports page overlays onto matching page hosts', async () => {
    const Overlay = defineComponent({
      props: { pageNumber: { type: Number, required: true } },
      setup: (props) => () => h('span', { class: 'overlay-label' }, String(props.pageNumber)),
    })
    const container = document.createElement('div')
    container.innerHTML = `
      <div class="page" data-page-number="1"></div>
      <div class="page" data-page-number="2"></div>
    `
    document.body.appendChild(container)
    const wrapper = mount(VPdfPageOverlays, {
      props: {
        container,
        overlays: [{ id: 'badge', component: Overlay, pageNumbers: [2] }],
      },
      attachTo: document.body,
    })
    await flushPromises()
    const hosts = container.querySelectorAll('.vpdf-page-overlays')
    expect(hosts).toHaveLength(2)
    expect(hosts[0]?.textContent).toBe('')
    expect(hosts[1]?.textContent).toBe('2')
    wrapper.unmount()
    container.remove()
  })

  it('auto-registers default built-in toolbar controls', async () => {
    const state = ref({ ...createInitialViewerState(), pageCount: 4, loadState: 'ready' as const })
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: createBuiltinPlugins(),
    })
    await vi.waitFor(() => expect(manager.toolbarItemsView.value.length).toBeGreaterThan(5))
    const wrapper = mount(VPdfToolbar, { props: { api: createApi(manager, state, controller) } })
    expect(wrapper.find('[aria-label="Toggle sidebar"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Zoom"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Search"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Open PDF"]').exists()).toBe(false)
    manager.setEnabled(VPDF_BUILTIN_PLUGIN_IDS.search, false)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[aria-label="Search"]').exists()).toBe(false)
  })

  it('falls back to glyphs when no icon renderer is registered', async () => {
    const state = ref({ ...createInitialViewerState(), pageCount: 4, loadState: 'ready' as const })
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller, {
      plugins: createBuiltinPlugins(),
    })
    await vi.waitFor(() => expect(manager.toolbarItemsView.value.length).toBeGreaterThan(5))
    const wrapper = mount(VPdfToolbar, { props: { api: createApi(manager, state, controller) } })
    expect(wrapper.get('[aria-label="Search"]').find('svg').exists()).toBe(true)
    expect(wrapper.get('[aria-label="Toggle sidebar"]').find('svg').exists()).toBe(true)
  })

  it('moves secondary toolbar actions into overflow on a narrow viewer', async () => {
    const { wrapper, root, controller } = await mountBuiltinToolbar(320)
    await vi.waitFor(() => expect(wrapper.find('[aria-label="Zoom"]').exists()).toBe(false))
    expect(wrapper.find('[aria-label="Search"]').exists()).toBe(false)
    await wrapper.get('[aria-label="More actions"]').trigger('click')
    expect(wrapper.find('[aria-label="Zoom"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Search')
    expect(wrapper.text()).toContain('Rotate')
    expect(wrapper.text()).toContain('Download')
    const rotate = wrapper
      .findAll('button[role="menuitem"]')
      .find((button) => button.text().includes('Rotate'))
    const download = wrapper
      .findAll('button[role="menuitem"]')
      .find((button) => button.text().includes('Download'))
    const properties = wrapper
      .findAll('button[role="menuitem"]')
      .find((button) => button.text().includes('Properties'))
    expect(rotate?.find('svg').exists()).toBe(true)
    expect(download?.find('svg').exists()).toBe(true)
    expect(properties?.find('svg').exists()).toBe(true)
    expect(rotate).toBeDefined()
    await rotate!.trigger('click')
    expect(controller.rotate).toHaveBeenCalledWith(90)
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    wrapper.unmount()
    root.remove()
  })

  it('shows Highlight, Free text, and Draw labels after they move into overflow', async () => {
    const { wrapper, root } = await mountBuiltinToolbar(1024)
    await vi.waitFor(() =>
      expect(wrapper.find('.vpdf-toolbar-end-actions [aria-label="Highlight"]').exists()).toBe(false),
    )
    expect(wrapper.find('.vpdf-toolbar-end-actions [aria-label="Search"]').exists()).toBe(true)
    await wrapper.get('[aria-label="More actions"]').trigger('click')
    expect(wrapper.get('.vpdf-overflow [aria-label="Highlight"]').text()).toContain('Highlight')
    expect(wrapper.get('.vpdf-overflow [aria-label="Free text"]').text()).toContain('Free text')
    expect(wrapper.get('.vpdf-overflow [aria-label="Draw"]').text()).toContain('Draw')
    expect(wrapper.get('.vpdf-overflow [aria-label="Highlight"]').find('svg').exists()).toBe(true)
    expect(wrapper.get('.vpdf-overflow [aria-label="Free text"]').find('svg').exists()).toBe(true)
    expect(wrapper.get('.vpdf-overflow [aria-label="Draw"]').find('svg').exists()).toBe(true)
    wrapper.unmount()
    root.remove()
  })

  it('keeps Search on the bar at 880px while Download overflows', async () => {
    const { wrapper, root } = await mountBuiltinToolbar(880)
    await vi.waitFor(() =>
      expect(wrapper.find('.vpdf-toolbar-end-actions [aria-label="Search"]').exists()).toBe(true),
    )
    expect(wrapper.find('.vpdf-toolbar-end-actions [aria-label="Download"]').exists()).toBe(false)
    await wrapper.get('[aria-label="More actions"]').trigger('click')
    expect(wrapper.text()).toContain('Download')
    wrapper.unmount()
    root.remove()
  })

  it('moves Zoom into overflow at 560px', async () => {
    const { wrapper, root } = await mountBuiltinToolbar(560)
    await vi.waitFor(() => expect(wrapper.find('[aria-label="Zoom"]').exists()).toBe(false))
    await wrapper.get('[aria-label="More actions"]').trigger('click')
    expect(wrapper.find('[aria-label="Zoom"]').exists()).toBe(true)
    wrapper.unmount()
    root.remove()
  })

  it('renders a plugin modal inside the reader root', async () => {
    const state = ref(createInitialViewerState())
    const options = ref<VPdfViewerOptions>({})
    const controller = createMockController()
    const manager = new PluginManager(state, options, controller)
    const Panel = defineComponent({
      setup: () => () => h('button', { type: 'button', 'aria-label': 'Done' }, 'Done'),
    })
    manager.register({
      id: 'modal-demo',
      setup(ctx) {
        ctx.openModal({ component: Panel })
      },
    })
    await vi.waitFor(() => expect(manager.modalView.value?.component).toBeTruthy())

    const modal = manager.modalView.value!
    const restore = document.createElement('button')
    restore.textContent = 'Restore'
    document.body.append(restore)
    restore.focus()

    const root = document.createElement('div')
    root.setAttribute('data-vpdf', '')
    root.className = 'vpdf-root'
    document.body.append(root)

    const wrapper = mount(VPdfModal, {
      props: {
        restoreFocus: restore,
      },
      slots: {
        default: () => h(modal.component),
      },
      attrs: {
        onClose: () => manager.dismissModal(),
      },
      attachTo: root,
    })
    await flushPromises()

    const dialog = root.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
    expect(root.contains(dialog)).toBe(true)
    expect(document.body.querySelector(':scope > .vpdf-dialog-backdrop')).toBeNull()
    expect(document.activeElement).toBe(wrapper.get('[aria-label="Done"]').element)

    await wrapper.get('.vpdf-dialog-backdrop').trigger('keydown', { key: 'Escape' })
    expect(manager.modalView.value).toBeUndefined()

    wrapper.unmount()
    expect(document.activeElement).toBe(restore)
    root.remove()
    restore.remove()
  })
})
