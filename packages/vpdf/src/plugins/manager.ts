import { computed, markRaw, readonly, ref, shallowRef, type Component, type Ref } from 'vue'
import type { VPdfIconRenderer } from '../icons'
import type {
  VPdfActiveModal,
  VPdfPluginContext,
  VPdfPluginControl,
  VPdfPluginDefinition,
  VPdfPluginDisposer,
  VPdfPluginEvents,
  VPdfPluginMenuItem,
  VPdfPluginModal,
  VPdfPluginPageOverlay,
  VPdfPluginPanel,
  VPdfPluginsConfig,
  VPdfPluginShortcut,
  VPdfPluginToolbarItem,
} from './types'
import type {
  VPdfPrepareDocumentInitEvent,
  VPdfViewerController,
  VPdfViewerOptions,
  VPdfViewerState,
} from '../types'
import type { VPdfXfaThumbnailRasterizer } from '../utils/renderThumbnail'
import { VPDF_UI_SLOTS, type VPdfUiComponents, type VPdfUiSlot } from '../types/ui'

interface RegisteredPlugin {
  definition: VPdfPluginDefinition
  enabled: boolean
  active: boolean
  disposers: VPdfPluginDisposer[]
  state: unknown
  abort?: AbortController
}

function sortByOrder<T extends { order?: number; id: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id))
}

export class PluginManager {
  private readonly registry = new Map<string, RegisteredPlugin>()
  private readonly toolbarItems = ref<VPdfPluginToolbarItem[]>([])
  private readonly panels = ref<VPdfPluginPanel[]>([])
  private readonly menuItems = ref<VPdfPluginMenuItem[]>([])
  private readonly shortcuts = ref<VPdfPluginShortcut[]>([])
  private readonly controls = ref<VPdfPluginControl[]>([])
  private readonly overlays = ref<VPdfPluginPageOverlay[]>([])
  private readonly iconRenderers = shallowRef<VPdfIconRenderer[]>([])
  private readonly uiStacks = shallowRef<Partial<Record<VPdfUiSlot, Component[]>>>({})
  private readonly xfaThumbnailRasterizers = shallowRef<VPdfXfaThumbnailRasterizer[]>([])
  private readonly modal = shallowRef<VPdfActiveModal>()
  private readonly eventHandlers = new Map<keyof VPdfPluginEvents, Set<(...args: never[]) => unknown>>()
  private disposed = false

  readonly selectedPanelId = ref<string | undefined>()
  readonly modalView = computed(() => this.modal.value)

  readonly toolbarItemsView = computed(() => sortByOrder(this.toolbarItems.value))
  readonly panelsView = computed(() => sortByOrder(this.panels.value))
  readonly menuItemsView = computed(() => sortByOrder(this.menuItems.value))
  readonly shortcutsView = computed(() => this.shortcuts.value)
  readonly controlsView = computed(() => sortByOrder(this.controls.value))
  readonly overlaysView = computed(() => sortByOrder(this.overlays.value))
  readonly iconRendererView = computed(() => this.iconRenderers.value.at(-1))
  readonly uiView = computed(() => {
    const resolved: Partial<VPdfUiComponents> = {}
    for (const slot of VPDF_UI_SLOTS) {
      const last = this.uiStacks.value[slot]?.at(-1)
      if (last) resolved[slot] = last
    }
    return resolved
  })
  readonly xfaThumbnailRasterizerView = computed(() => this.xfaThumbnailRasterizers.value.at(-1))

  constructor(
    private readonly state: Ref<VPdfViewerState>,
    private readonly options: Ref<VPdfViewerOptions>,
    private readonly controller: VPdfViewerController,
    private readonly config: VPdfPluginsConfig = {},
    private readonly viewerHost: Ref<HTMLElement | undefined> = ref(),
  ) {
    for (const plugin of config.plugins ?? []) {
      this.register(plugin)
    }
  }

  register(definition: VPdfPluginDefinition): void {
    if (this.disposed) return
    if (this.registry.has(definition.id)) {
      throw new Error(`[vpdf] plugin already registered: ${definition.id}`)
    }

    const enabledOverride = this.config.enabled?.[definition.id]
    const enabled = enabledOverride ?? definition.enabled ?? true
    const state = definition.createState?.(definition.options)

    this.registry.set(definition.id, {
      definition,
      enabled,
      active: false,
      disposers: [],
      state,
    })

    if (enabled) {
      void this.activate(definition.id)
    }
  }

  unregister(id: string): void {
    this.deactivate(id)
    this.registry.delete(id)
  }

  setEnabled(id: string, enabled: boolean): void {
    const entry = this.registry.get(id)
    if (!entry) return
    entry.enabled = enabled
    if (enabled) void this.activate(id)
    else this.deactivate(id)
  }

  isEnabled(id: string): boolean {
    return this.registry.get(id)?.enabled ?? false
  }

  list(): Array<{ id: string; enabled: boolean; active: boolean; name?: string }> {
    return [...this.registry.values()].map((entry) => ({
      id: entry.definition.id,
      enabled: entry.enabled,
      active: entry.active,
      name: entry.definition.name,
    }))
  }

  emit<K extends keyof VPdfPluginEvents>(
    event: K,
    ...args: Parameters<NonNullable<VPdfPluginEvents[K]>>
  ): void {
    const handlers = this.eventHandlers.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      try {
        ;(handler as (...a: unknown[]) => unknown)(...args)
      } catch (error) {
        console.error(`[vpdf] plugin event handler error (${String(event)})`, error)
      }
    }
  }

  prepareDocumentInit(payload: VPdfPrepareDocumentInitEvent): void {
    this.emit('onPrepareDocumentInit', payload)
  }

  on<K extends keyof VPdfPluginEvents>(
    event: K,
    handler: NonNullable<VPdfPluginEvents[K]>,
  ): VPdfPluginDisposer {
    let set = this.eventHandlers.get(event)
    if (!set) {
      set = new Set()
      this.eventHandlers.set(event, set)
    }
    set.add(handler as (...args: never[]) => unknown)
    return () => {
      set?.delete(handler as (...args: never[]) => unknown)
    }
  }

  matchShortcut(event: KeyboardEvent): VPdfPluginShortcut | undefined {
    return this.shortcuts.value.find((shortcut) => {
      if (shortcut.when && !shortcut.when()) return false
      if (shortcut.key.toLowerCase() !== event.key.toLowerCase()) return false
      if (!!shortcut.ctrl !== event.ctrlKey) return false
      if (!!shortcut.meta !== event.metaKey) return false
      if (!!shortcut.alt !== event.altKey) return false
      if (!!shortcut.shift !== event.shiftKey) return false
      return true
    })
  }

  dispose(): void {
    this.disposed = true
    for (const id of [...this.registry.keys()]) {
      this.deactivate(id)
    }
    this.registry.clear()
    this.toolbarItems.value = []
    this.panels.value = []
    this.menuItems.value = []
    this.shortcuts.value = []
    this.controls.value = []
    this.overlays.value = []
    this.iconRenderers.value = []
    this.uiStacks.value = {}
    this.xfaThumbnailRasterizers.value = []
    this.modal.value = undefined
    this.selectedPanelId.value = undefined
    this.eventHandlers.clear()
  }

  dismissModal(): void {
    this.modal.value = undefined
  }

  selectPanel(id: string | undefined): void {
    this.selectedPanelId.value = id
  }

  private async activate(id: string): Promise<void> {
    const entry = this.registry.get(id)
    if (!entry || entry.active || !entry.enabled || this.disposed) return

    const abort = new AbortController()
    entry.abort = abort
    entry.active = true

    const ctx = this.createContext(entry, abort.signal)

    try {
      const result = await entry.definition.setup(ctx, entry.definition.options)
      if (typeof result === 'function') {
        entry.disposers.push(result)
      }
    } catch (error) {
      console.error(`[vpdf] plugin setup failed: ${id}`, error)
      this.deactivate(id)
    }
  }

  private deactivate(id: string): void {
    const entry = this.registry.get(id)
    if (!entry) return
    entry.abort?.abort()
    entry.abort = undefined
    if (this.modal.value?.ownerId === id) {
      this.modal.value = undefined
    }
    for (const dispose of entry.disposers.splice(0).reverse()) {
      try {
        dispose()
      } catch (error) {
        console.error(`[vpdf] plugin dispose error: ${id}`, error)
      }
    }
    entry.active = false
  }

  private createContext(entry: RegisteredPlugin, signal: AbortSignal): VPdfPluginContext {
    const pluginId = entry.definition.id
    const track = (dispose: VPdfPluginDisposer): VPdfPluginDisposer => {
      entry.disposers.push(dispose)
      return () => {
        dispose()
        const idx = entry.disposers.indexOf(dispose)
        if (idx >= 0) entry.disposers.splice(idx, 1)
      }
    }

    const addListItem = <T extends { id: string }>(
      list: Ref<T[]>,
      item: T,
    ): VPdfPluginDisposer => {
      const owned = { ...item, id: item.id.includes(':') ? item.id : `${pluginId}:${item.id}` }
      if ('component' in owned && owned.component && typeof owned.component === 'object') {
        ;(owned as T & { component: object }).component = markRaw(owned.component as object)
      }
      if ('icon' in owned && owned.icon && typeof owned.icon === 'object') {
        ;(owned as T & { icon: object }).icon = markRaw(owned.icon as object)
      }
      list.value = [...list.value, owned]
      return track(() => {
        list.value = list.value.filter((entry) => entry.id !== owned.id)
      })
    }

    return {
      id: pluginId,
      state: this.state,
      options: this.options,
      controller: this.controller,
      viewerHost: readonly(this.viewerHost) as Readonly<Ref<HTMLElement | undefined>>,
      signal,
      getDocument: () => this.controller.getDocument(),
      getPage: (pageNumber) => this.controller.getPage(pageNumber),
      getPageGeometry: (pageNumber) => this.controller.getPageGeometry(pageNumber),
      registerToolbarItem: (item) => addListItem(this.toolbarItems, item),
      registerPanel: (panel) => {
        const owned = {
          ...panel,
          id: panel.id.includes(':') ? panel.id : `${pluginId}:${panel.id}`,
          component: markRaw(panel.component),
        }
        this.panels.value = [...this.panels.value, owned]
        if (!this.selectedPanelId.value) this.selectedPanelId.value = owned.id
        return track(() => {
          this.panels.value = this.panels.value.filter((entry) => entry.id !== owned.id)
          if (!this.panels.value.some((entry) => entry.id === this.selectedPanelId.value)) {
            this.selectedPanelId.value = this.panels.value[0]?.id
          }
        })
      },
      registerMenuItem: (item) => addListItem(this.menuItems, item),
      registerShortcut: (shortcut) => addListItem(this.shortcuts, shortcut),
      registerControl: (control) => addListItem(this.controls, control),
      registerPageOverlay: (overlay) => addListItem(this.overlays, overlay),
      openModal: (modal: VPdfPluginModal) => {
        if (this.disposed || signal.aborted) return
        this.modal.value = {
          ...modal,
          ownerId: pluginId,
          component: markRaw(modal.component),
        }
      },
      closeModal: () => {
        if (this.modal.value?.ownerId === pluginId) {
          this.modal.value = undefined
        }
      },
      registerIconRenderer: (renderer) => {
        const owned = markRaw(renderer)
        this.iconRenderers.value = [...this.iconRenderers.value, owned]
        return track(() => {
          this.iconRenderers.value = this.iconRenderers.value.filter((entry) => entry !== owned)
        })
      },
      registerUiComponent: (slot: VPdfUiSlot, component: Component) => {
        const owned = markRaw(component)
        const stacks = { ...this.uiStacks.value }
        stacks[slot] = [...(stacks[slot] ?? []), owned]
        this.uiStacks.value = stacks
        return track(() => {
          const next = { ...this.uiStacks.value }
          next[slot] = (next[slot] ?? []).filter((entry) => entry !== owned)
          this.uiStacks.value = next
        })
      },
      registerXfaThumbnailRasterizer: (rasterizer) => {
        const owned = markRaw(rasterizer)
        this.xfaThumbnailRasterizers.value = [...this.xfaThumbnailRasterizers.value, owned]
        return track(() => {
          this.xfaThumbnailRasterizers.value = this.xfaThumbnailRasterizers.value.filter(
            (entry) => entry !== owned,
          )
        })
      },
      xfaThumbnailRasterizer: this.xfaThumbnailRasterizerView,
      emit: (event, ...args) => {
        this.emit(event, ...args)
      },
      on: (event, handler) => track(this.on(event, handler)),
      getPluginState: <T>() => entry.state as T | undefined,
      setPluginState: <T>(value: T) => {
        entry.state = value
      },
    }
  }
}

export { resolvePluginFlag } from './resolve'

export function createPluginManager(
  state: Ref<VPdfViewerState>,
  options: Ref<VPdfViewerOptions>,
  controller: VPdfViewerController,
  config?: VPdfPluginsConfig,
  viewerHost?: Ref<HTMLElement | undefined>,
): PluginManager {
  return new PluginManager(state, options, controller, config, viewerHost)
}
