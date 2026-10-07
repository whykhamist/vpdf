# Advanced: PluginManager

Most plugins should use [`VPdfPluginContext`](/plugins/context) inside `setup`. Custom shells, tests, and headless hosts that render `toolbarItemsView` themselves use `PluginManager` directly.

`VPdfViewer` and `useVPdfViewer` already construct a manager, merge built-ins, and wire engine events. You need `createPluginManager` only when you are **not** using those entry points.

::: info
`new PluginManager(...)` / `createPluginManager(...)` registers `config.plugins` as given. It does **not** call `createBuiltinPlugins()` or `mergeViewerPlugins`. `useVPdfViewer` does.
:::

## Creating a manager

```ts
import { ref } from "vue";
import {
  createPluginManager,
  createBuiltinPlugins,
  mergeViewerPlugins,
} from "@whykhamist/vpdf";

const plugins = createPluginManager(
  state,
  options,
  controller,
  {
    plugins: mergeViewerPlugins(createBuiltinPlugins(), [MyPlugin()]),
    enabled: { "vpdf.download": false },
  },
  containerRef,
);
```

Arguments: viewer `state` ref, `options` ref, `VPdfViewerController`, optional `VPdfPluginsConfig`, optional `viewerHost` ref (defaults to `ref()`).

`useVPdfViewer` returns the same class as `api.plugins`.

## Methods

| Method | Role |
| --- | --- |
| `register(definition)` | Add a plugin. Throws if `id` exists. No-op after `dispose()`. Starts `activate` if enabled |
| `unregister(id)` | Deactivate and delete the registry entry (including plugin state) |
| `setEnabled(id, enabled)` | Runtime toggle. Missing ids are ignored |
| `isEnabled(id)` | `false` if unknown |
| `list()` | `{ id, enabled, active, name? }[]` |
| `emit(event, ...args)` | Same typed bus as `ctx.emit` |
| `on(event, handler)` | Subscribe; returns a disposer. Not tied to a plugin unless you register from `setup` |
| `matchShortcut(event)` | First matching [`VPdfPluginShortcut`](/plugins/types/#vpdfpluginshortcut), or `undefined` |
| `dismissModal()` | Clear the current plugin modal regardless of owner |
| `selectPanel(id)` | Set `selectedPanelId` (`undefined` allowed) |
| `prepareDocumentInit(payload)` | Emits `onPrepareDocumentInit` |
| `dispose()` | Deactivate all, clear registry, views, modal, handlers. Further `register` is a no-op |

`unregister` is a method on the class. It is not a separate package export.

## Views

These are Vue computeds (except `selectedPanelId`, a `ref`). Default `VPdfViewer` reads them to render hosts.

| View | Contents |
| --- | --- |
| `toolbarItemsView` | Toolbar items, sorted by `order` then `id` |
| `panelsView` | Panels, same sort |
| `menuItemsView` | Overflow menu items, same sort |
| `shortcutsView` | Shortcuts in **registration order** (unsorted) |
| `controlsView` | Region controls, sorted |
| `overlaysView` | Page overlays, sorted |
| `iconRendererView` | Last icon renderer, or `undefined` |
| `uiView` | Last component per UI slot |
| `xfaThumbnailRasterizerView` | Last XFA rasterizer |
| `modalView` | Current [`VPdfActiveModal`](/plugins/types/#vpdfactivemodal) (`ownerId` + modal fields) |
| `selectedPanelId` | Selected panel id |

Filter visible items and resolve `props` the same way the default shell does. `isPluginItemVisible` and `pluginItemProps` live in the library source (`plugins/resolve.ts`) but are **not** re-exported from `@whykhamist/vpdf`. Copy the one-liners if a custom shell needs them:

```ts
import { toValue } from "vue";

function isPluginItemVisible(item: { visible?: unknown }): boolean {
  return item.visible === undefined || Boolean(toValue(item.visible as never));
}

function pluginItemProps(item: { props?: unknown }): Record<string, unknown> {
  return toValue(item.props as never) ?? {};
}
```

## Headless host checklist

If you skip `VPdfViewer`:

1. `mount(el)` so `viewerHost` and the engine exist (`load` throws otherwise).
2. Listen for `keydown` and call `matchShortcut`; decide whether to `preventDefault` (`!== false` in the default shell). Skip when the target is an input, if you want viewer parity.
3. Render `modalView` (password UI is **not** on the manager; it lives on `state.password` in the default shell).
4. Render toolbar, sidebar, controls, and overlays from the views.
5. Call `destroy()` / `plugins.dispose()` on unmount.

Shortcuts, password overlay, and page-overlay teleport are default-shell behavior, not `PluginManager` internals.

## Runtime enable from a host

```ts
api.plugins.setEnabled("vpdf.search", false);
api.plugins.setEnabled("my-plugin", true);
```

That is the supported live toggle. Do not mutate `plugins.enabled` after construction and expect the manager to notice.
