# Writing a plugin

`id` and `setup` are required. Everything else is optional. See [`VPdfPluginDefinition`](/plugins/types/#vpdfplugindefinition) for all fields.

```ts
import type { VPdfPluginDefinition } from "@whykhamist/vpdf";

export function MyPlugin(): VPdfPluginDefinition {
  return {
    id: "my-plugin",
    name: "My plugin",
    version: "1.0.0",

    setup(ctx) {
      // Plugin setup
    },
  };
}
```

| Line | Why it matters |
| --- | --- |
| Factory function | Lets you pass options later (`MyPlugin({ color: "#2563eb" })`) without sharing one definition object across viewers. |
| `id: "my-plugin"` | Registry key. Must be unique unless you intend to [replace a built-in](/plugins/overview#built-in-vs-user-vs-extension). |
| `name` / `version` | Informational. `PluginManager.list()` includes `name`. The manager does not parse `version`. |
| `setup(ctx)` | Runs when the plugin is activated. Registrations, event listeners, and abortable work go here. |

`setup` may return a disposer, a `Promise`, or nothing. Returning nothing is valid: `register*` and `ctx.on` are tracked automatically. Return a disposer when you create watches, timers, DOM listeners, or other work the manager cannot see. See [Lifecycle](/plugins/lifecycle#cleanup).

## Register it with the viewer

```vue
<script setup lang="ts">
import { VPdfViewer } from "@whykhamist/vpdf";
import { MyPlugin } from "./my-plugin";

const src = "/sample.pdf";
const plugins = {
  plugins: [MyPlugin()],
};
</script>

<template>
  <VPdfViewer :src="src" :plugins="plugins" />
</template>
```

Call `MyPlugin()`. Passing the factory function itself is not a plugin definition.

## Register it with `useVPdfViewer`

The composable takes `{ options, plugins }`. `options` is required.

```ts
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  useVPdfViewer,
  type VPdfViewerOptions,
} from "@whykhamist/vpdf";
import { MyPlugin } from "./my-plugin";

const options = ref<VPdfViewerOptions>({ src: "/sample.pdf" });

const api = useVPdfViewer({
  options,
  plugins: { plugins: [MyPlugin()] },
});

onMounted(() => {
  api.mount(container.value);
});

onBeforeUnmount(() => {
  api.destroy();
});
```

`useVPdfViewer` still merges built-ins, then your `plugins.plugins`. You must `mount` a host element; `controller.load` throws if the container is not mounted. Keyboard shortcuts are only wired by `VPdfViewer` (a `window` `keydown` listener). A custom shell must call `api.plugins.matchShortcut(event)` itself. See [Advanced / PluginManager](/plugins/advanced).

## Add a toolbar item

```ts
export function MyPlugin(): VPdfPluginDefinition {
  return {
    id: "my-plugin",
    name: "My plugin",
    setup(ctx) {
      const dispose = ctx.registerToolbarItem({
        id: "action",
        label: "Action",
        onClick() {
          ctx.openModal({
            component: MyModal,
            dismissible: true,
          });
        },
      });

      return dispose;
    },
  };
}
```

`registerToolbarItem` returns a disposer. Calling it unregisters that item immediately. If you never call it, the manager still unregisters the item when the plugin is disabled or the viewer is destroyed.

The stored toolbar id becomes `my-plugin:action` unless your `id` already contains `:`.

## `VPdfPluginDefinition`

Full field list: [Type reference](/plugins/types/#vpdfplugindefinition).

```ts
interface VPdfPluginDefinition<TOptions = any, TState = any> {
  id: string;
  name?: string;
  version?: string;
  enabled?: boolean;
  options?: TOptions;
  createState?: (options: TOptions | undefined) => TState;
  setup: (
    ctx: VPdfPluginContext,
    options: TOptions | undefined,
  ) => void | VPdfPluginDisposer | Promise<void | VPdfPluginDisposer>;
}
```

| Property | Required | Type | Purpose |
| --- | --- | --- | --- |
| `id` | yes | `string` | Registry key and ID prefix for registrations |
| `name` | no | `string` | Label in `PluginManager.list()` |
| `version` | no | `string` | Informational only |
| `enabled` | no | `boolean` | Default `true`. Overridden by `plugins.enabled[id]` at register time |
| `options` | no | `TOptions` | Stored on the definition. Passed to `createState` and `setup` |
| `createState` | no | `(options) => TState` | Runs **once** at `register()`, not on re-enable |
| `setup` | yes | `(ctx, options) => ...` | Activates the plugin. May be async |

### `id`

Required. Duplicate ids throw at `PluginManager.register`. `useVPdfViewer` never hits that path for built-in clashes because `mergeViewerPlugins` replaces the built-in definition first.

### `enabled`

Omitted means enabled. `plugins.enabled[id]` wins when present, including `false`. Runtime changes require `setEnabled`.

### `options`

Not merged with viewer `options`. This is plugin-specific configuration, such as `{ markColor: "#2563eb" }`. Viewer flags stay on `ctx.options`.

### `createState`

Use it for a per-plugin data bag. The return value is stored on the registry entry. `getPluginState` / `setPluginState` read and replace that value. It is not a Vue reactive store. See [Plugin state](/plugins/state).

### `setup`

Receives [plugin context](/plugins/context) and the definition’s `options`. Activation is async: `register()` does `void activate(id)` and does not await `setup`. If `setup` throws, the manager logs `[vpdf] plugin setup failed: <id>` and deactivates the plugin. The plugin stays **enabled** but **inactive** until you `setEnabled(false)` then `setEnabled(true)`, or register a new manager.

## Common mistakes

### Plugin does not appear

- The factory was not called: use `plugins: [MyPlugin()]`, not `plugins: [MyPlugin]`.
- The plugin is missing from `plugins.plugins`.
- `plugins.enabled[id]` or `definition.enabled` is `false`.
- `setup` threw. Check the console for `plugin setup failed`.
- A toolbar/panel `visible` getter returns `false`, or a built-in is hidden by `options.toolbar` / `options.features`.

### A built-in plugin disappeared

A user plugin with the same `id` replaced it. Use a unique id unless replacement is intentional. See [Overview](/plugins/overview#built-in-vs-user-vs-extension).

### Registration disappears

The plugin was disabled, `setup`’s disposer ran, you called the registration disposer, or the viewer was destroyed (`plugins.dispose()`). Re-enabling runs `setup` again and must re-register.

### `viewerHost` is undefined

`setup` runs before `VPdfViewer` mounts. Watch `ctx.viewerHost` with `{ immediate: true }`. See [Plugin context](/plugins/context#viewerhost).

### `plugins.enabled` change had no effect

That map is read once at `register()`. Call `api.plugins.setEnabled(id, false)` for a live toggle.

### Shortcut never fires

`VPdfViewer` ignores shortcuts when focus is in `INPUT`, `SELECT`, `TEXTAREA`, or a `contentEditable` node. Modifier flags must match the event **exactly**: `{ key: "p", ctrl: true }` does not fire for Ctrl+Shift+P. The first registered match wins.

### Modal behaves unexpectedly

`closeModal()` closes only **this** plugin’s modal. A later `openModal` from another plugin replaces the current one. The password dialog takes precedence over plugin modals. There is no `title` on `openModal`. See [UI and modals](/plugins/ui).

### Vue component became deeply reactive

Pass component **constructors**. The manager `markRaw`s object `component` and `icon` values. Still `markRaw` components you keep in module scope if you also pass them through other reactive objects.
