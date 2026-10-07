# Open plugin

Package: `@whykhamist/vpdf-plugin-open` (`3.0.0`).

Adds a toolbar control that loads a local PDF with `controller.load(file)`.

## Install

```bash
npm install @whykhamist/vpdf-plugin-open @whykhamist/vpdf
```

Register the plugin to show the Open control. Disable with `plugins.enabled['vpdf.open'] = false`.

```ts
import { createOpenPlugin } from "@whykhamist/vpdf-plugin-open";

const plugins = {
  plugins: [createOpenPlugin()],
};
```

`VPdfOpenPlugin` is the same factory (`createOpenPlugin` is an alias).

## Behavior

| Item | Value |
| --- | --- |
| Id | `vpdf.open` (`VPDF_OPEN_PLUGIN_ID`) |
| Toolbar | `kind: 'control'`, `placement: 'start'`, `order: 0` |
| Visible | plugin registered and enabled |
| Disabled | `loadState === 'loading'` |
| Accept | `application/pdf,.pdf` |

`setEnabled('vpdf.open', false)` removes the control.

There is no plugin options object. Hosts can also build a file picker and call `controller.load(file)`.
