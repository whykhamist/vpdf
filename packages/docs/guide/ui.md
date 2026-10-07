# UI components

The viewer UI (toolbar, sidebar, dialogs, and controls around the PDF) is built from replaceable primitives. Plugins may reuse them; hosts and plugins may replace them. Plugin `openModal` and `registerUiComponent` are documented in [UI and modals](/plugins/ui).

Import from `@whykhamist/vpdf`:

- `VPdfButton` — `variant`: `ghost` (default), `outline`, `solid`
- `VPdfInput` — `v-model`, optional `invalid`
- `VPdfSelect` — `v-model`, default slot for `<option>` / `<optgroup>`
- `VPdfCheckbox` — `v-model` boolean, `label` or default slot
- `VPdfDropdownMenu` — default slot `{ open, toggle, close }`, `#content`
- `VPdfCard` — `title`, slots `header` / `title` / default / `footer`
- `VPdfModal` — default slot, `dismissible` (default `true`), `busy`, `restoreFocus`

Inputs and selects use a filled field with an underline that expands on focus (same treatment as the page number field).

## Replace a component

Merge order, later wins:

1. Package defaults (`VPDF_UI_DEFAULTS`)
2. `ctx.registerUiComponent(slot, component)` — last registration per slot wins; the disposer restores the previous one
3. `<VPdfViewer :ui="{ button: MyButton }" />` — host has final say ([`VPdfUiComponents`](/guide/types#vpdfuicomponents))

Slots: `button`, `input`, `select`, `checkbox`, `dropdownMenu`, `card`, `modal`.

A replacement must accept the same props, slots, and events as the default. There is no adapter layer. Outside a viewer (for example standalone `VPdfPasswordDialog`), inject is missing and the public components render the defaults.

```vue
<script setup lang="ts">
import { VPdfViewer, type VPdfUiComponents } from "@whykhamist/vpdf";
import MyButton from "./MyButton.vue";

const ui: Partial<VPdfUiComponents> = { button: MyButton };
</script>

<template>
  <VPdfViewer :src="src" :ui="ui" />
</template>
```

```ts
setup(ctx) {
  return ctx.registerUiComponent("button", MyButton);
}
```
