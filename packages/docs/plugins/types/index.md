# Plugin type reference

Field-by-field catalog of plugin-related TypeScript types. Import from `@whykhamist/vpdf` unless a page names an extension package.

For behavior, defaults, and examples, follow the linked guide pages. Extension package types live under [Types](/plugins/types/open) in the sidebar. Viewer and core types are in the [Guide type reference](/guide/types). [`PluginManager`](/plugins/advanced) is documented separately.

## Configuration

### VPdfPluginsConfig

Plugin list for `<VPdfViewer :plugins>` or `useVPdfViewer`. See [Plugin overview](/plugins/overview).

| Property | Type | Description |
| --- | --- | --- |
| `plugins` | `VPdfPluginDefinition[]` | User and extension plugin factories |
| `enabled` | `Record<string, boolean>` | Plugin id → enabled override; read at `register()` time |

## Plugin events

### VPdfPluginEvents

Typed plugin bus keys for `ctx.on` / `ctx.emit`. See [Plugin events](/plugins/events).

| Event | Payload | Description |
| --- | --- | --- |
| `onDocumentLoad` | `{ pageCount: number }` | Document ready |
| `onReady` | — | After document is shown |
| `onDocumentClose` | — | Document closed while plugin active |
| `onPageChange` | `VPdfPageChangeEvent` | Page or count changed |
| `onScaleChange` | `VPdfScaleChangeEvent` | Zoom changed |
| `onPassword` | `VPdfPasswordRequest` | Password required |
| `onProgress` | `VPdfProgressEvent` | Load progress |
| `onError` | `VPdfErrorEvent` | Load / engine error |
| `onAnnotationChange` | `VPdfAnnotationChangeEvent` | Annotation lifecycle |
| `onAttachmentDownload` | `VPdfAttachmentDownloadEvent` | Attachment save confirmation |
| `onPrepareDocumentInit` | `VPdfPrepareDocumentInitEvent` | Before `getDocument()` |

### VPdfPageChangeEvent

| Property | Type | Description |
| --- | --- | --- |
| `pageNumber` | `number` | Current page |
| `pageCount` | `number` | Total pages |

### VPdfScaleChangeEvent

| Property | Type | Description |
| --- | --- | --- |
| `scale` | `number` | Numeric scale |
| `preset` | `string` | Fit preset name when applicable |

### VPdfAnnotationChangeEvent

| Property | Type | Description |
| --- | --- | --- |
| `type` | `'added' \| 'updated' \| 'removed' \| 'committed'` | Change kind |
| `editorMode` | `VPdfAnnotationEditorMode` | Editor mode |
| `pageNumber` | `number` | Affected page |
| `raw` | `unknown` | PDF.js raw payload |

### VPdfAttachmentDownloadEvent

| Property | Type | Description |
| --- | --- | --- |
| `attachment` | `VPdfAttachment` | File metadata |
| `download` | `() => Promise<void>` | Call after user confirms |

### VPdfPrepareDocumentInitEvent

| Property | Type | Description |
| --- | --- | --- |
| `params` | `VPdfGetDocumentParameters` | Mutable `getDocument` draft |
| `context` | `VPdfDocumentLoadContext` | Source and password |

### VPdfDocumentLoadContext

| Property | Type | Description |
| --- | --- | --- |
| `source` | `VPdfSource` | Document source |
| `password` | `string` | Optional password |

### VPdfGetDocumentParameters

Draft passed to `pdfjs.getDocument()`, including runtime flags `isEvalSupported` and `enableScripting`. vpdf restores reserved fields after plugins run.

## Plugin options

### VpdfAnnotationsPluginOptions

Built-in annotations plugin options.

| Property | Type | Description |
| --- | --- | --- |
| `editorComponent` | `Component` | Replace default inline editor UI |

### VPdfIconRenderer

```ts
type VPdfIconRenderer = Component<VPdfIconRendererProps>;
```

Vue component registered with `registerIconRenderer`. Last registration wins per viewer.

### VPdfIconRendererProps

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | Icon slot or custom name |
| `fallback` | `string` | SVG fallback when renderer returns nothing |

## Plugin system

### VPdfPluginDefinition

See [Writing a plugin](/plugins/writing).

| Property | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique registry key |
| `name` | `string` | Label in `PluginManager.list()` |
| `version` | `string` | Informational |
| `enabled` | `boolean` | Default `true`; overridden by `plugins.enabled[id]` |
| `options` | `TOptions` | Plugin-specific config |
| `createState` | `(options) => TState` | Runs once at `register()` |
| `setup` | `(ctx, options) => void \| VPdfPluginDisposer \| Promise<...>` | Activation hook |

### VPdfPluginContext

See [Plugin context](/plugins/context).

| Member | Type / signature | Description |
| --- | --- | --- |
| `id` | `string` | Plugin definition id |
| `state` | `Readonly<Ref<VPdfViewerState>>` | Viewer state |
| `options` | `Readonly<Ref<VPdfViewerOptions>>` | Viewer options |
| `controller` | `VPdfViewerController` | Controller |
| `viewerHost` | `Readonly<Ref<HTMLElement \| undefined>>` | Mount container after `mount()` |
| `signal` | `AbortSignal` | Aborted on deactivate |
| `getDocument` | `() => PDFDocumentProxy \| undefined` | Current document |
| `getPage` | `(n) => Promise<PDFPageProxy \| undefined>` | PDF.js page |
| `getPageGeometry` | `(n) => VPdfPageGeometry \| undefined` | Rendered geometry |
| `registerToolbarItem` | `(item) => VPdfPluginDisposer` | Toolbar item |
| `registerPanel` | `(panel) => VPdfPluginDisposer` | Sidebar panel |
| `registerMenuItem` | `(item) => VPdfPluginDisposer` | Overflow menu item |
| `registerShortcut` | `(shortcut) => VPdfPluginDisposer` | Keyboard shortcut |
| `registerControl` | `(control) => VPdfPluginDisposer` | Viewer region control |
| `registerPageOverlay` | `(overlay) => VPdfPluginDisposer` | Page overlay |
| `registerIconRenderer` | `(renderer) => VPdfPluginDisposer` | Icon renderer |
| `registerUiComponent` | `(slot, component) => VPdfPluginDisposer` | UI slot override |
| `registerXfaThumbnailRasterizer` | `(fn) => VPdfPluginDisposer` | XFA thumbnail rasterizer |
| `xfaThumbnailRasterizer` | `Ref<VPdfXfaThumbnailRasterizer \| undefined>` | Last registered rasterizer |
| `openModal` | `(modal: VPdfPluginModal) => void` | Show plugin modal |
| `closeModal` | `() => void` | Close this plugin's modal |
| `on` | `(event, handler) => VPdfPluginDisposer` | Subscribe to typed events |
| `emit` | `(event, ...args) => void` | Emit typed event |
| `getPluginState` | `<T>() => T \| undefined` | Plugin state bag |
| `setPluginState` | `<T>(value: T) => void` | Replace plugin state |

### VPdfPluginDisposer

```ts
type VPdfPluginDisposer = () => void;
```

Returned from `register*` and `ctx.on`; call to unregister early.

### VPdfPluginToolbarPlacement

```ts
type VPdfPluginToolbarPlacement =
  | "start"
  | "center"
  | "end"
  | "annotations"
  | "overflow";
```

### VPdfPluginToolbarActionItem

Toolbar button. See [Registration](/plugins/registration).

| Property | Type | Description |
| --- | --- | --- |
| `id` | `string` | Item id (namespaced as `pluginId:localId`) |
| `kind` | `'action'` | Omitted or `'action'` |
| `label` | `string` | Visible label |
| `title` | `MaybeRefOrGetter<string>` | Tooltip |
| `icon` | `MaybeRefOrGetter<Component \| string>` | Icon slot or component |
| `disabled` | `MaybeRefOrGetter<boolean>` | Disabled state |
| `active` | `MaybeRefOrGetter<boolean>` | Pressed / active state |
| `onClick` | `() => void \| Promise<void>` | Click handler |
| `placement` | `VPdfPluginToolbarPlacement` | Toolbar region |
| `order` | `number` | Sort order; default `0` |
| `visible` | `MaybeRefOrGetter<boolean>` | Visibility |

### VPdfPluginToolbarControlItem

| Property | Type | Description |
| --- | --- | --- |
| `kind` | `'control'` | Required |
| `component` | `Component` | Custom control |
| `props` | `MaybeRefOrGetter<Record<string, unknown>>` | Props for component |
| `id`, `placement`, `order`, `visible` | | Same as action item |

### VPdfPluginToolbarItem

```ts
type VPdfPluginToolbarItem =
  | VPdfPluginToolbarActionItem
  | VPdfPluginToolbarControlItem;
```

### VPdfPluginPanel

| Property | Type | Description |
| --- | --- | --- |
| `id` | `string` | Panel id |
| `label` | `string` | Tab label |
| `title` | `string` | Panel title |
| `icon` | `MaybeRefOrGetter<Component \| string>` | Tab icon |
| `order` | `number` | Sort order |
| `visible` | `MaybeRefOrGetter<boolean>` | Visibility |
| `component` | `Component` | Panel body |
| `props` | `MaybeRefOrGetter<Record<string, unknown>>` | Props for component |

### VPdfPluginMenuItem

| Property | Type | Description |
| --- | --- | --- |
| `id` | `string` | Menu item id |
| `label` | `string` | Label |
| `icon` | `MaybeRefOrGetter<Component \| string>` | Icon |
| `order` | `number` | Sort order |
| `visible` | `MaybeRefOrGetter<boolean>` | Visibility |
| `disabled` | `MaybeRefOrGetter<boolean>` | Disabled |
| `onClick` | `() => void \| Promise<void>` | Click handler |

### VPdfPluginShortcut

| Property | Type | Description |
| --- | --- | --- |
| `id` | `string` | Shortcut id |
| `key` | `string` | `KeyboardEvent.key` value |
| `ctrl` | `boolean` | Require Ctrl |
| `meta` | `boolean` | Require Meta |
| `alt` | `boolean` | Require Alt |
| `shift` | `boolean` | Require Shift |
| `preventDefault` | `boolean` | Call `preventDefault` when matched |
| `when` | `() => boolean` | Extra guard |
| `handler` | `(event: KeyboardEvent) => void \| Promise<void>` | Handler |

### VPdfPluginControl

| Property | Type | Description |
| --- | --- | --- |
| `id` | `string` | Control id |
| `region` | `'viewer-top' \| 'viewer-bottom' \| 'page-overlay-host'` | Render region |
| `order` | `number` | Sort order |
| `visible` | `MaybeRefOrGetter<boolean>` | Visibility |
| `component` | `Component` | Control component |
| `props` | `MaybeRefOrGetter<Record<string, unknown>>` | Props |

### VPdfPluginPageOverlay

| Property | Type | Description |
| --- | --- | --- |
| `id` | `string` | Overlay id |
| `order` | `number` | Sort order |
| `visible` | `MaybeRefOrGetter<boolean>` | Visibility |
| `pageNumbers` | `number[]` | Limit to pages; omit for all pages |
| `component` | `Component` | Receives `pageNumber` prop |
| `props` | `MaybeRefOrGetter<Record<string, unknown>>` | Extra props |

### VPdfPluginModal

See [UI and modals](/plugins/ui).

| Property | Type | Description |
| --- | --- | --- |
| `component` | `Component` | Modal body (default slot) |
| `props` | `MaybeRefOrGetter<Record<string, unknown>>` | Bound to component |
| `busy` | `MaybeRefOrGetter<boolean>` | `aria-busy` |
| `dismissible` | `MaybeRefOrGetter<boolean>` | Escape and backdrop; default `true` |
| `restoreFocus` | `HTMLElement` | Focus on close |

### VPdfActiveModal

`VPdfPluginModal` plus `ownerId: string` — plugin that opened the current modal (`modalView` on `PluginManager`).

### VPdfXfaThumbnailRasterizeParams

From `@whykhamist/vpdf`. Used by XFA thumbnail rasterization.

| Property | Type | Description |
| --- | --- | --- |
| `source` | `HTMLElement` | XFA HTML preview element |
| `canvas` | `HTMLCanvasElement` | Target thumbnail canvas |
| `cssWidth` | `number` | CSS width |
| `cssHeight` | `number` | CSS height |
| `pixelRatio` | `number` | Device pixel ratio |

### VPdfXfaThumbnailRasterizer

```ts
type VPdfXfaThumbnailRasterizer = (
  params: VPdfXfaThumbnailRasterizeParams,
) => Promise<void>;
```

Register with `ctx.registerXfaThumbnailRasterizer`. See [XFA thumbnail raster](/plugins/xfa-thumbnail-raster).
