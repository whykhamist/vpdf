# Registration APIs

Toolbar, panel, shortcut, and related shapes are in the [Type reference](/plugins/types/#plugin-system). Each `register*` method adds an item to a viewer host and returns a disposer. Calling the disposer unregisters that item. Disable / destroy also runs it.

::: tip
Every `register*` method returns a disposer. Keep it only when you need to unregister early.
:::

Ids without `:` are stored as `pluginId:localId`. List items that expose `order` are sorted by `order` (default `0`) then by id. Shortcuts are **not** sorted; match order is registration order.

`visible`, `disabled`, `title`, `icon`, `active`, and `props` accept Vue refs or getters (`MaybeRefOrGetter`) where the types allow it. Re-evaluate them by returning `ctx.state` / `ctx.options` values from a getter or `computed`.

The manager `markRaw`s object `component` and `icon` values.

## `registerToolbarItem()`

Adds a button or a custom control to the viewer toolbar (including overflow).

Use an **action** for a click handler (download, rotate, your command). Use a **control** for a widget that needs its own Vue component (zoom select, page number, Open file).

**Action** (`kind` omitted or `"action"`):

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Namespaced unless it contains `:` |
| `label` | yes | Visible text; also used in overflow |
| `onClick` | yes | `() => void \| Promise<void>` |
| `placement` | no | `start` \| `center` \| `end` \| `annotations` \| `overflow` |
| `order` | no | Default `0` |
| `visible` | no | `MaybeRefOrGetter<boolean>` |
| `title` | no | `MaybeRefOrGetter<string>` tooltip |
| `icon` | no | `MaybeRefOrGetter<Component \| string>` slot name or component |
| `disabled` | no | `MaybeRefOrGetter<boolean>` |
| `active` | no | `MaybeRefOrGetter<boolean>` pressed/on state |

**Control** (`kind: "control"`):

| Field | Required | Notes |
| --- | --- | --- |
| `kind` | yes | `"control"` |
| `component` | yes | Vue component |
| `props` | no | `MaybeRefOrGetter<Record<string, unknown>>` |
| plus `id`, `placement`, `order`, `visible` | | Same as action |

```ts
const dispose = ctx.registerToolbarItem({
  id: "my-action",
  label: "My action",
  placement: "end",
  order: 90,
  icon: "search",
  disabled: () => ctx.state.value.loadState !== "ready",
  visible: () => ctx.options.value.toolbar !== false,
  onClick() {
    // ...
  },
});
```

Reactive control props (zoom pattern):

```ts
import { computed } from "vue";

ctx.registerToolbarItem({
  id: "zoom",
  kind: "control",
  placement: "center",
  component: ZoomControls,
  visible: () => isToolbarFeatureEnabled(ctx.options.value, "zoom"),
  props: computed(() => ({
    scale: ctx.state.value.scale,
    onZoomIn: () => ctx.controller.zoomIn(),
  })),
});
```

`placement: "overflow"` always lives in the overflow menu. On a narrow toolbar, the default shell also **moves** secondary actions into overflow; that is host layout, not a plugin API.

`dispose()` removes the item. Plugin deactivate removes it even if you never call `dispose`.

## `registerMenuItem()`

Adds a command to the overflow (“More actions”) menu. This is separate from a toolbar item with `placement: "overflow"`. Both appear in that menu.

Use overflow-only commands that should not take a toolbar slot: document properties, reset, “About”.

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | |
| `label` | yes | |
| `onClick` | yes | |
| `icon` | no | `MaybeRefOrGetter<Component \| string>` |
| `order` | no | |
| `visible` | no | `MaybeRefOrGetter<boolean>` |
| `disabled` | no | `MaybeRefOrGetter<boolean>` |

No `placement`. Menu items are not actions on the main bar.

```ts
const dispose = ctx.registerMenuItem({
  id: "reset",
  label: "Reset demo marks",
  order: 20,
  disabled: () => marks.value === 0,
  onClick() {
    marks.value = 0;
    ctx.setPluginState({ marks: 0 });
  },
});
```

## `registerPanel()`

Adds a sidebar panel. The default shell renders registered panels in `VPdfSidebar` when `state.sidebar` is not `"none"`.

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | |
| `label` | yes | Tab label |
| `component` | yes | Panel body |
| `title` | no | string |
| `icon` | no | `MaybeRefOrGetter<Component \| string>` |
| `order` | no | Thumbnails `10`, outline `20`, attachments `30` |
| `visible` | no | `MaybeRefOrGetter<boolean>` |
| `props` | no | `MaybeRefOrGetter<Record<string, unknown>>` |

- The first registered panel becomes `selectedPanelId` if none is selected.
- `PluginManager.selectPanel(id)` changes the selection.
- Unregistering the selected panel selects the first remaining panel, or `undefined`.
- Registering a panel does **not** open the sidebar. The navigation built-in toggles `setSidebar("thumbnails" | "none")`. Custom panels typically tell the user to open the sidebar, or call `ctx.controller.setSidebar("plugins")` (the slot the sidebar host uses for plugin panels).

The panel component does **not** receive plugin context by inject. Pass data through `props`:

```ts
ctx.registerPanel({
  id: "demo",
  label: "Demo",
  component: DemoPanel,
  order: 100,
  props: computed(() => ({
    marks: marks.value,
    onReset: () => {
      marks.value = 0;
    },
  })),
});
```

```vue
<script setup lang="ts">
defineProps<{ marks: number; onReset: () => void }>();
</script>
```

The disposer removes the panel and repairs `selectedPanelId`.

## `registerShortcut()`

Records a key binding. `VPdfViewer` listens on `window` `keydown` and calls `plugins.matchShortcut(event)`.

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | |
| `key` | yes | Compared to `KeyboardEvent.key`, case-insensitive |
| `handler` | yes | `(event: KeyboardEvent) => void \| Promise<void>` |
| `ctrl` | no | Must match `event.ctrlKey` **exactly** |
| `meta` | no | Must match `event.metaKey` exactly |
| `alt` | no | Must match `event.altKey` exactly |
| `shift` | no | Must match `event.shiftKey` exactly |
| `preventDefault` | no | Default: prevent. Set `false` to leave the event alone |
| `when` | no | `() => boolean`. If present and false, the shortcut does not match |

Omitted `ctrl` / `meta` / `alt` / `shift` is treated as `false`. `{ key: "p", ctrl: true }` matches Ctrl+P only, not Ctrl+Shift+P and not Meta+P.

`KeyboardEvent.ctrlKey` and `metaKey` are independent. Chrome on Windows sets `ctrlKey` for Control; Chrome on macOS sets `metaKey` for Command. Built-ins register **both** variants:

```ts
ctx.registerShortcut({
  id: "find-ctrl",
  key: "f",
  ctrl: true,
  when: findEnabled,
  handler: openFind,
});
ctx.registerShortcut({
  id: "find-meta",
  key: "f",
  meta: true,
  when: findEnabled,
  handler: openFind,
});
```

`matchShortcut` returns the **first** shortcut in registration order for which:

1. `when()` is absent or returns true
2. `key` matches case-insensitively
3. All four modifier flags match the event

There is no conflict error. Built-ins register first, then user plugins, so a built-in binding wins over a later user plugin with the same key chord. To own a built-in shortcut, [replace that built-in](/plugins/overview) or disable it.

`VPdfViewer` ignores shortcuts when the event target is `INPUT`, `SELECT`, `TEXTAREA`, or `contentEditable`. Headless `useVPdfViewer` does **not** install this listener.

```ts
const dispose = ctx.registerShortcut({
  id: "mark-shortcut",
  key: "m",
  alt: true,
  when: () => ctx.state.value.loadState === "ready",
  handler: bump,
});
```

## `registerControl()`

Mounts a Vue component in a named region of the default shell.

Use UI that is not a toolbar button and not per-page: search bar (`viewer-top`), print progress (`page-overlay-host`), annotation editor overlay (`page-overlay-host`).

| `region` | Where it renders in `VPdfViewer` |
| --- | --- |
| `viewer-top` | Above the page host, inside the main column (search bar) |
| `viewer-bottom` | Below the page host |
| `page-overlay-host` | Inside the page host, over the page stack (not teleported into each `.page`) |

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | |
| `region` | yes | One of the three strings above |
| `component` | yes | |
| `order` | no | |
| `visible` | no | `MaybeRefOrGetter<boolean>` |
| `props` | no | `MaybeRefOrGetter<Record<string, unknown>>` |

```ts
ctx.registerControl({
  id: "progress",
  region: "page-overlay-host",
  visible: () => printing.value,
  component: PrintProgressOverlay,
  props: computed(() => ({
    progress: printProgress.value,
    onCancel: () => abort(),
  })),
});
```

## `registerPageOverlay()`

Teleports a component into a `.vpdf-page-overlays` host on matching PDF pages (`VPdfPageOverlays`). It sits on the page surface, not in the viewer shell.

Use badges, stamps, and page-local tools. For one overlay covering all pages as a single layer, use a `page-overlay-host` control instead.

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | |
| `component` | yes | Receives `pageNumber` |
| `pageNumbers` | no | Page list. Omit or pass `[]` to render on every page |
| `order` | no | |
| `visible` | no | `MaybeRefOrGetter<boolean>` |
| `props` | no | Merged onto the component in addition to `pageNumber` |

The host watches the viewer container for `.page[data-page-number]` nodes and creates overlay hosts as pages appear.

```ts
const PageBadge = defineComponent({
  props: { pageNumber: { type: Number, required: true } },
  setup(props) {
    return () =>
      h("span", { class: "absolute top-2 right-2" }, `Page ${props.pageNumber}`);
  },
});

const dispose = ctx.registerPageOverlay({
  id: "badge",
  component: PageBadge,
  // pageNumbers: [1, 2], // only those pages
});
```

## `registerIconRenderer()`

Pushes a Vue component onto a stack. `iconRendererView` is the **last** entry. `VPdfIcon` uses that renderer when present; otherwise `VPDF_ICON_FALLBACKS` SVG glyphs.

The renderer is `Component<VPdfIconRendererProps>` with `name: string` and optional `fallback?: string`.

Last registration wins. Disabling that plugin restores the previous renderer. `markRaw` is applied.

```ts
return ctx.registerIconRenderer(MyIconRenderer);
```

See [Iconify](/plugins/iconify). There is no built-in icon renderer.

## `registerXfaThumbnailRasterizer()` {#xfa-thumbnail-rasterizer}

Registers `(params) => Promise<void>`. Params: `{ source, canvas, cssWidth, cssHeight, pixelRatio }`.

Without a rasterizer, XFA thumbnail cells show an inert HTML preview and hide the canvas. With one, the Pages panel calls the last registered function (see [XFA thumbnail raster](/plugins/xfa-thumbnail-raster)).

Last registration wins; disable restores the previous. Exposed on context as `ctx.xfaThumbnailRasterizer`.

```ts
ctx.registerXfaThumbnailRasterizer(async ({ source, canvas, pixelRatio }) => {
  // paint source onto canvas
});
```

## UI components and modals

`registerUiComponent` and `openModal` are documented in [UI and modals](/plugins/ui).
