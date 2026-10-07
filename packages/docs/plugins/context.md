# Plugin context

`setup` receives a [`VPdfPluginContext`](/plugins/types/#vpdfplugincontext). Plugins use this object and never touch `PluginManager` directly.

```ts
setup(ctx, options) {
  ctx.registerToolbarItem({ /* ... */ });
}
```

The second argument is `definition.options`, not viewer options. Viewer options are `ctx.options`.

## Members

| Member | Type | Role |
| --- | --- | --- |
| `id` | `string` | Plugin definition id |
| `state` | `Readonly<Ref<VPdfViewerState>>` — [fields](/guide/types#vpdfviewerstate) | Viewer state |
| `options` | `Readonly<Ref<VPdfViewerOptions>>` — [fields](/guide/types#vpdfvieweroptions) | Viewer options |
| `controller` | [`VPdfViewerController`](/guide/types#vpdfviewercontroller) | Navigation, load, find, download, … |
| `viewerHost` | `Readonly<Ref<HTMLElement \| undefined>>` | Mount container after `mount()` |
| `signal` | `AbortSignal` | Aborted on deactivate |
| `getDocument()` | `PDFDocumentProxy \| undefined` | Current PDF.js document |
| `getPage(n)` | `Promise<PDFPageProxy \| undefined>` | One PDF.js page |
| `getPageGeometry(n)` | [`VPdfPageGeometry`](/guide/types#vpdfpagegeometry) \| `undefined` | Rendered page viewport |
| `getPluginState()` / `setPluginState()` | per-plugin bag | See [Plugin state](/plugins/state) |
| `xfaThumbnailRasterizer` | [`VPdfXfaThumbnailRasterizer`](/plugins/types/#vpdfxfathumbnailrasterizer) ref | Last registered XFA rasterizer |
| `register*` | see [Registration](/plugins/registration) | Toolbar, panels, shortcuts, … |
| `openModal` / `closeModal` | see [UI and modals](/plugins/ui) | Plugin-owned dialog |
| `on` / `emit` | see [Events](/plugins/events) | Typed plugin events |

## `id`

Same string as `definition.id`. Registration ids without `:` are stored as `${id}:${itemId}`.

## `state` and `options`

Typed as readonly refs of [viewer state](/guide/state-and-controller) and [viewer options](/guide/options). They are the same refs the viewer holds. Read `.value` inside getters and `computed` so toolbar `visible` / `disabled` / `props` stay reactive:

```ts
visible: () => ctx.options.value.toolbar !== false,
props: computed(() => ({
  pageCount: ctx.state.value.pageCount,
})),
```

Prefer the controller for mutations (`goToPage`, `setScale`, `setSidebar`). Do not store plugin-private data here — use [plugin state](/plugins/state).

## `controller`

Stable `VPdfViewerController`. Safe to close over in `setup`. Methods that need a mounted engine (`load`, `getPage`, …) follow the same rules as the rest of the viewer: `load` calls `ensureMounted()` and throws if no container was mounted.

`getExperimentalViewer()` is an unstable escape hatch (page-layout uses it). Do not rely on its shape in application plugins.

## `viewerHost` {#viewerhost}

::: info
`ctx.viewerHost` is `undefined` until the viewer has mounted.
:::

`PluginManager` is constructed, and enabled plugins are activated, **before** `VPdfViewer` runs `onMounted` → `api.mount(el)`. Reading `ctx.viewerHost.value` at the top of `setup` is usually `undefined`.

Watch it:

```ts
import { watch } from "vue";

setup(ctx) {
  const stop = watch(
    () => ctx.viewerHost.value,
    (host) => {
      if (!host) return;
      // bind to host or host.querySelector(".vpdf-viewer-scroll")
    },
    { immediate: true },
  );

  return stop;
}
```

The zoom built-in uses this pattern. `viewerHost` is the only context ref wrapped with Vue `readonly()`.

## `signal`

See [Lifecycle](/plugins/lifecycle#ctxsignal). New per activation. `openModal` ignores calls after abort. Listen when you start abortable work; do not assume built-ins listen to it except where they do (Print).

## PDF.js helpers

These delegate to the controller / engine.

### `getDocument()`

Synchronous. Returns the current `PDFDocumentProxy`, or `undefined` when no document is loaded (idle, loading, error, after `close()`). Use it after `onReady` / `onDocumentLoad`, or guard `if (!ctx.getDocument()) return`.

### `getPage(pageNumber)`

Async. Returns `undefined` when there is no document, or when `pageNumber` is outside `1..numPages`. Otherwise `pdfDocument.getPage(pageNumber)`.

```ts
const page = await ctx.getPage(1);
if (!page) return;
const viewport = page.getViewport({ scale: 1 });
```

### `getPageGeometry(pageNumber)`

Synchronous. Reads the **rendered** PDF.js page view (`pdfViewer.getPageView(pageNumber - 1)`). Returns `undefined` before mount, before the page view exists, or if that view has no viewport.

```ts
export interface VPdfPageGeometry {
  pageNumber: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
  transform: number[];
}
```

Geometry is the on-screen viewport, not the raw PDF page box from `getPage`.

## `xfaThumbnailRasterizer`

Readonly ref of the last registered rasterizer on this manager (same value as `xfaThumbnailRasterizerView`). The thumbnails built-in passes `ctx.xfaThumbnailRasterizer.value` into the Pages panel. Disabling the plugin that registered the current rasterizer restores the previous one. See [Registration](/plugins/registration#xfa-thumbnail-rasterizer).

## Registration ownership

Each `register*` returns a [`VPdfPluginDisposer`](/plugins/types/#vpdfplugindisposer). The manager also tracks that disposer for deactivate. Components and object icons are `markRaw`’d.

If `id` does not contain `:`, the stored id is `pluginId:localId`. Pass an id that already contains `:` to keep it as-is.
