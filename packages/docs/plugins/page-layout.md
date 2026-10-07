# Page layout plugin

Package: `@whykhamist/vpdf-plugin-page-layout` (`3.0.0`).

Adds a toolbar `<select>` that maps onto PDF.js `scrollMode` / `spreadMode`. **No** `toolbar.*` flag is required — the control shows whenever the plugin is registered and enabled.

## Install

```bash
npm install @whykhamist/vpdf-plugin-page-layout @whykhamist/vpdf
```

```ts
import { createPageLayoutPlugin } from "@whykhamist/vpdf-plugin-page-layout";

const plugins = {
  plugins: [createPageLayoutPlugin({ defaultMode: "vertical" })],
};
```

Id: `"page-layout"` (not `vpdf.*` prefixed). Factory alias: `VPdfPageLayoutPlugin`.

## Modes

[`VPdfPageLayoutMode`](/plugins/types/page-layout#vpdfpagelayoutmode) values:

| Mode | Behavior | scrollMode | spreadMode |
| --- | --- | --- | --- |
| `vertical` | Single column, top to bottom (default) | VERTICAL (0) | NONE |
| `horizontal` | Horizontal strip | HORIZONTAL (1) | NONE (forced) |
| `two-column` | Pairs 1–2, 3–4, … | VERTICAL | ODD |
| `wrapped` | As many pages per row as scale and width allow | WRAPPED (2) | NONE |
| `single-page` | One page at a time, full-document scrollbar | PAGE (3) | NONE (forced) |

`PAGE_LAYOUT_OPTIONS` exports label/value pairs for custom UI. `mapPageLayoutMode` and `applyPageLayout` are public helpers.

## Lifecycle

- Dropdown is disabled until `onReady`.
- PDF.js resets layout on load, so the plugin **reapplies** the last mode on `onReady`.
- `onDocumentClose` disables the control.
- Disabling the plugin restores `vertical` + NONE and removes the toolbar item.

Layout is applied through `controller.getExperimentalViewer()`. That API is experimental; this package is the supported way to change scroll/spread mode.
