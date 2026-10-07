# Installation

`@whykhamist/vpdf` is a Vue 3 PDF viewer built on PDF.js. It ships as ESM with TypeScript types and a dedicated stylesheet scoped to `.vpdf-root`.

## Requirements

Ensure your project meets the following peer dependency requirements before proceeding:

- Vue `^3.5`
- `pdfjs-dist@6.3.289`

> [!NOTE]
> `pdfjs-dist` is a runtime dependency of `@whykhamist/vpdf`. Install it explicitly in the host app when resolving PDF.js worker and asset URLs.
> `pdfjs-dist` is required as a peer/runtime dependency so you can control or resolve worker and asset URLs seamlessly within your host application.

## Install

::: code-group

```sh [npm]
npm install @whykhamist/vpdf pdfjs-dist@6.3.289
```

:::

Import the package stylesheet once in your app:

```ts
import "@whykhamist/vpdf/style.css";
```

## Register the viewer

You can register the viewer either globally across your app or locally within specific components.

### Global registration

Register the Vue plugin to make `<VPdfViewer>` available globally without individual imports:

```ts
import { createApp } from "vue";
import VPdf from "@whykhamist/vpdf";
import "@whykhamist/vpdf/style.css";
import App from "./App.vue";

createApp(App).use(VPdf).mount("#app");
```

### Local registration

Alternatively, import `VPdfViewer` directly in the components where it is used:

```vue
<script setup lang="ts">
import { VPdfViewer } from "@whykhamist/vpdf";
import "@whykhamist/vpdf/style.css";
</script>
```

## Styles & Tailwind CSS Integration

The package stylesheet is built using Tailwind CSS 4 and is strictly scoped to `.vpdf-root` to prevent style leaks. You do not need to have Tailwind CSS installed in your host app to use it.

If your app already uses Tailwind CSS 4, import both stylesheets in your main CSS entry point:

```css
@import "tailwindcss";
@import "@whykhamist/vpdf/style.css";
```

## Package exports

| Export                       | Contents                                          |
| ---------------------------- | ------------------------------------------------- |
| `@whykhamist/vpdf`           | Components, composable, plugin helpers, and types |
| `@whykhamist/vpdf/style.css` | Scoped viewer stylesheet (`.vpdf-root`)           |

## Optional plugins

Extend the viewer's functionality by installing only the plugins you need:

::: code-group

```sh [npm]
npm install @whykhamist/vpdf-plugin-open
npm install @whykhamist/vpdf-plugin-print
npm install @whykhamist/vpdf-plugin-page-layout
npm install @whykhamist/vpdf-plugin-iconify
npm install @whykhamist/vpdf-plugin-xfa-thumbnail-raster
```

:::

### Plugin Overview

- [`@whykhamist/vpdf-plugin-open`](/plugins/open)

  > Adds file picker and local file-loading capabilities, allowing users to easily open external PDF documents directly within the viewer interface.

- [`@whykhamist/vpdf-plugin-print`](/plugins/print)

  > Enables native document printing support, letting users print the active PDF directly from the viewer.

- [`@whykhamist/vpdf-plugin-page-layout`](/plugins/page-layout)

  > Provides advanced layout controls, allowing users to toggle between single-page, continuous, and multi-column spread viewing modes.

- [`@whykhamist/vpdf-plugin-iconify`](/plugins/iconify)

  > Integrates Iconify support (bundling `@iconify/vue` and vscode-icons) to dynamically render toolbar and UI action icons.

- [`@whykhamist/vpdf-plugin-xfa-thumbnail-raster`](/plugins/xfa-thumbnail-raster)
  > Uses ['html2canvas'](https://html2canvas.hertzen.com/) to rasterize XFA document thumbnails into a single canvas. Without this plugin, XFA thumbnails render as scaled-down HTML elements which can increase DOM complexity; this plugin optimizes performance by converting them into lightweight canvas nodes.
