# UI components and modals

Plugins can open a dialog and replace viewer primitives (`VPdfButton`, `VPdfModal`, …). Viewer UI component slots are listed in [UI components](/guide/ui).

## Modals

[`VPdfPluginModal`](/plugins/types/#vpdfpluginmodal) options:

```ts
ctx.openModal({
  component,
  props?,
  busy?,
  dismissible?,
  restoreFocus?,
});
```

There is **one** current plugin modal on the manager. A later `openModal` overwrites it. Password UI from the engine, when present, is shown **instead of** the plugin modal (`dismissible: false`).

::: warning
`closeModal()` only closes the current plugin's modal.
:::

A second plugin calling `closeModal()` is a no-op if it does not own the modal. The default shell’s Escape / backdrop path calls `dismissModal()`, which clears whichever plugin modal is showing.

### Options

| Field | Type | Default | Role |
| --- | --- | --- | --- |
| `component` | `Component` | required | Body of the dialog (default slot of `VPdfModal`) |
| `props` | `MaybeRefOrGetter<Record<string, unknown>>` | — | Bound onto `component` |
| `busy` | `MaybeRefOrGetter<boolean>` | `false` | `aria-busy`; refocuses the first control when it changes |
| `dismissible` | `MaybeRefOrGetter<boolean>` | `true` unless the value is `false` | Escape and backdrop click |
| `restoreFocus` | `HTMLElement` | — | Focused on unmount if still connected |

::: warning
There is no `title` prop on `openModal`.
:::

Put `VPdfCard` (or any content) in the modal default slot — that is, make `component` render a card:

```vue
<script setup lang="ts">
import { VPdfButton, VPdfCard } from "@whykhamist/vpdf";

defineProps<{ marks: number }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <VPdfCard title="Marks">
    <p>Count: {{ marks }}</p>
    <template #footer>
      <VPdfButton variant="solid" @click="emit('close')">Close</VPdfButton>
    </template>
  </VPdfCard>
</template>
```

`VPdfCard` uses `VPDF_MODAL_TITLE_ID` when inside a modal so `aria-labelledby` matches. The viewer forwards `@close` from your component to `dismissModal()`.

### Focus, Tab, Escape, backdrop

Default `VPdfModal`:

- Focuses the first focusable node (or the dialog) on mount.
- Traps Tab / Shift+Tab inside the dialog.
- Escape: `preventDefault`, then close if `dismissible`.
- Backdrop click (`click.self`): close if `dismissible`.
- Backdrop `keydown` `stopPropagation` so the event does not reach the viewer shortcut listener.
- On unmount, focuses `restoreFocus` if `restoreFocus.isConnected`.

`openModal` no-ops when the manager is disposed or `ctx.signal` is aborted.

### Ownership

| Call | Effect |
| --- | --- |
| `ctx.openModal(...)` | Sets the global modal with `ownerId = ctx.id` |
| `ctx.closeModal()` | Clears only if `ownerId === ctx.id` |
| `plugins.dismissModal()` | Clears unconditionally |
| Owning plugin deactivated | Modal cleared |
| Other plugin deactivated | Modal unchanged |

### Example

```ts
ctx.registerMenuItem({
  id: "about",
  label: "Marks",
  onClick() {
    ctx.openModal({
      component: MarksModal,
      props: computed(() => ({ marks: marks.value })),
      dismissible: true,
    });
  },
});
```

## `registerUiComponent`

```ts
const dispose = ctx.registerUiComponent(slot, component);
```

Supported slots:

```ts
"button" | "input" | "select" | "checkbox" | "dropdownMenu" | "card" | "modal"
```

A replacement must accept the same props, slots, and events as the default. There is no adapter layer.

Until the disposer runs, the plugin is disabled, or the viewer is destroyed, that slot uses the registered component.

Each slot is a **stack**. `uiView[slot]` is `.at(-1)`. A second plugin that registers `button` hides the first plugin’s button. The disposer **removes that plugin’s component** from the stack; the previous component becomes visible again.

::: warning
The viewer `:ui` prop overrides plugin UI component registrations.
:::

Merge order, later wins:

1. Package defaults (`VPDF_UI_DEFAULTS`)
2. Plugin stack (last registration per slot)
3. `<VPdfViewer :ui="{ button: MyButton }" />`

The manager `markRaw`s the component you pass. Built-ins still `markRaw` module-level components before storing them in other reactive objects. Do the same if you keep a component in a `ref` or `reactive` object of your own.

```ts
setup(ctx) {
  return ctx.registerUiComponent("button", MyButton);
}
```

Host still wins:

```vue
<VPdfViewer :src="src" :ui="{ button: HostButton }" :plugins="plugins" />
```

Outside a viewer (standalone `VPdfPasswordDialog`), inject is missing and the public components render defaults.

See [UI components](/guide/ui) for primitive props and host-only replacement.
