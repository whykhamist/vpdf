# Vue PDF (VPDF)

Custom PDF viewer for Vue. Built on top of [PDF.js](https://github.com/mozilla/pdf.js)

- [Features](#features)
- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
  - [Styles](#styles)
- [Components](#components)
  - [`VPdf`](#vpdf)
  - [`VPdfViewer`](#vpdfviewer)
  - [`VPdfPageRenderer`](#vpdfpagerenderer)
- [Composables](#composables)
  - [`usePdf`](#usepdf)
  - [`usePdfViewer`](#usepdfviewer)
- [Types](#types)

## Features

- Utilizes `virtual scrolling` to render PDFs with huge page count
- Supports password protected PDFs
- Textlayer support
- PDF Thumbnails
- PDF Bookmarks
- Show/download Attachments

## Installation

```js
$ npm i @whykhamist/vpdf
```

## Setup

```js
import { createApp } from "vue";
import App from "./app.vue";
import VPdf from "@whykhamist/vpdf";

import "@whykhamist/vpdf/style.css";

async function init() {
  const app = createApp(App);
  app.use(VPdf);
  app.mount("#app");
}

init();
```

## Usage

```js
import { ref } from "vue";

// acrobat_reference.pdf (651 pages): https://helpx.adobe.com/pdf/acrobat_reference.pdf

// pdfreference1.7old.pdf (1310 pages)
const src = ref(
  "https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.7old.pdf",
);
const smoothJump = ref(false);
const textLayer = ref(false);
const theme = ref(""); // blank for light, vpdf-dark for dark
```

```html
<template>
  <VPdf
    :src="src"
    :smoothJump="smoothJump"
    :textLayer="textLayer"
    :class="theme"
  />
</template>
```

### Styles

Colors can be customized using css variables:
`Default` colors for light & dark modes

```css
:root {
  /* Foreground (light) */
  --color-foreground-50: #f9fafb;
  --color-foreground-100: #f3f4f6;
  --color-foreground-200: #e5e7eb;
  --color-foreground-300: #d1d5db;
  --color-foreground-400: #9ca3af;
  --color-foreground-500: #202327;
  --color-foreground-600: #181a1d;
  --color-foreground-700: #121416;
  --color-foreground-800: #0c0e0f;
  --color-foreground-900: #070708;
  --color-foreground-950: #000000;
  --color-foreground: #202327;

  /* Background (light) */
  --color-background-50: #ffffff;
  --color-background-100: #f9fafb;
  --color-background-200: #f3f4f6;
  --color-background-300: #e5e7eb;
  --color-background-400: #d1d5db;
  --color-background-500: #9ca3af;
  --color-background-600: #6b7280;
  --color-background-700: #4b5563;
  --color-background-800: #374151;
  --color-background-900: #1f2937;
  --color-background-950: #111827;
  --color-background: #ffffff;

  /* Primary (light, #2f3e52) */
  --color-primary-50: #f2f4f7;
  --color-primary-100: #e6e9ee;
  --color-primary-200: #c2cbd6;
  --color-primary-300: #9daec0;
  --color-primary-400: #748ba2;
  --color-primary-500: #2f3e52;
  --color-primary-600: #263242;
  --color-primary-700: #1f2935;
  --color-primary-800: #171f28;
  --color-primary-900: #10161d;
  --color-primary-950: #0a0d12;
  --color-primary: #2f3e52;

  /* Secondary (light, #a3bddc) */
  --color-secondary-50: #f8fafc;
  --color-secondary-100: #edf2f9;
  --color-secondary-200: #d8e3f2;
  --color-secondary-300: #c3d3eb;
  --color-secondary-400: #a3bddc;
  --color-secondary-500: #7ca0c9;
  --color-secondary-600: #5d83b1;
  --color-secondary-700: #46678f;
  --color-secondary-800: #324a68;
  --color-secondary-900: #202f44;
  --color-secondary-950: #111827;
  --color-secondary: #a3bddc;

  /* Accent (light, #4676bd) */
  --color-accent-50: #f4f7fc;
  --color-accent-100: #e8eff9;
  --color-accent-200: #d0dff2;
  --color-accent-300: #a7c3e5;
  --color-accent-400: #7da5d5;
  --color-accent-500: #4676bd;
  --color-accent-600: #365e96;
  --color-accent-700: #294872;
  --color-accent-800: #1d334f;
  --color-accent-900: #132033;
  --color-accent-950: #0a1019;
  --color-accent: #4676bd;

  /* Positive (light, #40bf77) */
  --color-positive-50: #f0fdf7;
  --color-positive-100: #d9fbe9;
  --color-positive-200: #b4f5d4;
  --color-positive-300: #86eab8;
  --color-positive-400: #57d996;
  --color-positive-500: #40bf77;
  --color-positive-600: #2e9b60;
  --color-positive-700: #23794c;
  --color-positive-800: #195839;
  --color-positive-900: #0f3725;
  --color-positive-950: #081d14;
  --color-positive: #40bf77;

  /* Negative (light, #ef5f4f) */
  --color-negative-50: #fff5f4;
  --color-negative-100: #ffe5e2;
  --color-negative-200: #fec7c1;
  --color-negative-300: #fba199;
  --color-negative-400: #f17367;
  --color-negative-500: #ef5f4f;
  --color-negative-600: #d93c2a;
  --color-negative-700: #b42e20;
  --color-negative-800: #8d2318;
  --color-negative-900: #671912;
  --color-negative-950: #3a0c08;
  --color-negative: #ef5f4f;
}

.vpdf-dark {
  /* Foreground (dark) */
  --vpdf-color-foreground-50: #111827;
  --vpdf-color-foreground-100: #1f2937;
  --vpdf-color-foreground-200: #374151;
  --vpdf-color-foreground-300: #4b5563;
  --vpdf-color-foreground-400: #6b7280;
  --vpdf-color-foreground-500: #ffffff;
  --vpdf-color-foreground-600: #e5e7eb;
  --vpdf-color-foreground-700: #f3f4f6;
  --vpdf-color-foreground-800: #f9fafb;
  --vpdf-color-foreground-900: #fcfcfd;
  --vpdf-color-foreground-950: #ffffff;
  --vpdf-color-foreground: #ffffff;

  /* Background (dark) */
  --vpdf-color-background-50: #202327;
  --vpdf-color-background-100: #1c1f23;
  --vpdf-color-background-200: #181b1e;
  --vpdf-color-background-300: #141619;
  --vpdf-color-background-400: #101215;
  --vpdf-color-background-500: #0c0e10;
  --vpdf-color-background-600: #08090a;
  --vpdf-color-background-700: #050506;
  --vpdf-color-background-800: #030304;
  --vpdf-color-background-900: #010101;
  --vpdf-color-background-950: #000000;
  --vpdf-color-background: #202327;

  /* Primary (dark, inverted from light secondary #a3bddc) */
  --vpdf-color-primary-50: #f5f8fc;
  --vpdf-color-primary-100: #e6eef7;
  --vpdf-color-primary-200: #ccd9ee;
  --vpdf-color-primary-300: #a3bddc;
  --vpdf-color-primary-400: #7d9ec7;
  --vpdf-color-primary-500: #587ead;
  --vpdf-color-primary-600: #406291;
  --vpdf-color-primary-700: #2f486f;
  --vpdf-color-primary-800: #20304a;
  --vpdf-color-primary-900: #121c2b;
  --vpdf-color-primary-950: #0a0e16;
  --vpdf-color-primary: #a3bddc;

  /* Secondary (dark, inverted from light primary #2f3e52) */
  --vpdf-color-secondary-50: #f2f4f7;
  --vpdf-color-secondary-100: #e6e9ee;
  --vpdf-color-secondary-200: #c2cbd6;
  --vpdf-color-secondary-300: #9daec0;
  --vpdf-color-secondary-400: #748ba2;
  --vpdf-color-secondary-500: #2f3e52;
  --vpdf-color-secondary-600: #263242;
  --vpdf-color-secondary-700: #1f2935;
  --vpdf-color-secondary-800: #171f28;
  --vpdf-color-secondary-900: #10161d;
  --vpdf-color-secondary-950: #0a0d12;
  --vpdf-color-secondary: #2f3e52;

  /* Accent (dark, shifted brighter #5b8dd4) */
  --vpdf-color-accent-50: #f5f8fc;
  --vpdf-color-accent-100: #e6eef9;
  --vpdf-color-accent-200: #cddcf3;
  --vpdf-color-accent-300: #a5c0e7;
  --vpdf-color-accent-400: #7fa3d9;
  --vpdf-color-accent-500: #5b8dd4;
  --vpdf-color-accent-600: #4770b0;
  --vpdf-color-accent-700: #36568a;
  --vpdf-color-accent-800: #253c60;
  --vpdf-color-accent-900: #16223a;
  --vpdf-color-accent-950: #0b111d;
  --vpdf-color-accent: #5b8dd4;

  /* Positive (dark, shifted brighter #4fdc8b) */
  --vpdf-color-positive-50: #f0fdf7;
  --vpdf-color-positive-100: #d1fae5;
  --vpdf-color-positive-200: #a7f3d0;
  --vpdf-color-positive-300: #6ee7b7;
  --vpdf-color-positive-400: #34d399;
  --vpdf-color-positive-500: #4fdc8b;
  --vpdf-color-positive-600: #22c773;
  --vpdf-color-positive-700: #16a162;
  --vpdf-color-positive-800: #0f7c4a;
  --vpdf-color-positive-900: #085635;
  --vpdf-color-positive-950: #042b1a;
  --vpdf-color-positive: #4fdc8b;

  /* Negative (dark, shifted brighter #ff7b6d) */
  --vpdf-color-negative-50: #fff5f5;
  --vpdf-color-negative-100: #ffe1e0;
  --vpdf-color-negative-200: #febfbb;
  --vpdf-color-negative-300: #fc9790;
  --vpdf-color-negative-400: #f96e64;
  --vpdf-color-negative-500: #ff7b6d;
  --vpdf-color-negative-600: #e53b2c;
  --vpdf-color-negative-700: #b82e22;
  --vpdf-color-negative-800: #8a231a;
  --vpdf-color-negative-900: #5c1711;
  --vpdf-color-negative-950: #2e0c08;
  --vpdf-color-negative: #ff7b6d;
}
```

We can also add our custom colors

```html
<style>
  .vpdf-sepia {
    /* Foreground (sepia) */
    --vpdf-color-foreground-50: #fdfaf5;
    --vpdf-color-foreground-100: #f8f1e7;
    --vpdf-color-foreground-200: #f2e6d7;
    --vpdf-color-foreground-300: #e6d3b8;
    --vpdf-color-foreground-400: #d4b98e;
    --vpdf-color-foreground-500: #5b4636;
    --vpdf-color-foreground-600: #4a382b;
    --vpdf-color-foreground-700: #3a2c22;
    --vpdf-color-foreground-800: #2b2119;
    --vpdf-color-foreground-900: #1c1510;
    --vpdf-color-foreground-950: #0e0a08;
    --vpdf-color-foreground: #5b4636;

    /* Background (sepia) */
    --vpdf-color-background-50: #fdfaf5;
    --vpdf-color-background-100: #f9f4eb;
    --vpdf-color-background-200: #f3ebdb;
    --vpdf-color-background-300: #e9dcc2;
    --vpdf-color-background-400: #dec9a7;
    --vpdf-color-background-500: #c6aa82;
    --vpdf-color-background-600: #a38461;
    --vpdf-color-background-700: #7c6347;
    --vpdf-color-background-800: #57452f;
    --vpdf-color-background-900: #352a1b;
    --vpdf-color-background-950: #1a140d;
    --vpdf-color-background: #f9f4eb;

    /* Primary (sepia-warmed from #2f3e52) */
    --vpdf-color-primary-50: #f6f3ef;
    --vpdf-color-primary-100: #eae2d8;
    --vpdf-color-primary-200: #d8c9b6;
    --vpdf-color-primary-300: #b89c82;
    --vpdf-color-primary-400: #8f6f55;
    --vpdf-color-primary-500: #6a533f;
    --vpdf-color-primary-600: #4f3d2f;
    --vpdf-color-primary-700: #3a2d23;
    --vpdf-color-primary-800: #281f18;
    --vpdf-color-primary-900: #191410;
    --vpdf-color-primary-950: #0c0907;
    --vpdf-color-primary: #6a533f;

    /* Secondary (sepia-warmed from #a3bddc) */
    --vpdf-color-secondary-50: #fbf8f4;
    --vpdf-color-secondary-100: #f4ece2;
    --vpdf-color-secondary-200: #e9dbc8;
    --vpdf-color-secondary-300: #d8c2a3;
    --vpdf-color-secondary-400: #c19e77;
    --vpdf-color-secondary-500: #9d7a58;
    --vpdf-color-secondary-600: #7c5d42;
    --vpdf-color-secondary-700: #5d4430;
    --vpdf-color-secondary-800: #3f2e20;
    --vpdf-color-secondary-900: #241b12;
    --vpdf-color-secondary-950: #110c07;
    --vpdf-color-secondary: #9d7a58;

    /* Accent (sepia-warmed from #4676bd → muted indigo-brown) */
    --vpdf-color-accent-50: #f9f6f3;
    --vpdf-color-accent-100: #f1e9e0;
    --vpdf-color-accent-200: #e3d5c2;
    --vpdf-color-accent-300: #cbb391;
    --vpdf-color-accent-400: #a68464;
    --vpdf-color-accent-500: #7c5e47;
    --vpdf-color-accent-600: #604737;
    --vpdf-color-accent-700: #473429;
    --vpdf-color-accent-800: #2f221b;
    --vpdf-color-accent-900: #1c130f;
    --vpdf-color-accent-950: #0c0806;
    --vpdf-color-accent: #7c5e47;

    /* Positive (sepia-warmed from #40bf77 → olive/tea green) */
    --vpdf-color-positive-50: #f6fbf4;
    --vpdf-color-positive-100: #e8f6e2;
    --vpdf-color-positive-200: #d1eac7;
    --vpdf-color-positive-300: #b0d6a1;
    --vpdf-color-positive-400: #89b879;
    --vpdf-color-positive-500: #678f59;
    --vpdf-color-positive-600: #4e6e45;
    --vpdf-color-positive-700: #3b5234;
    --vpdf-color-positive-800: #283725;
    --vpdf-color-positive-900: #181f16;
    --vpdf-color-positive-950: #0b0d0a;
    --vpdf-color-positive: #678f59;

    /* Negative (sepia-warmed from #ef5f4f → burnt clay red) */
    --vpdf-color-negative-50: #fcf6f4;
    --vpdf-color-negative-100: #f7e9e5;
    --vpdf-color-negative-200: #efcec8;
    --vpdf-color-negative-300: #e0a79d;
    --vpdf-color-negative-400: #c5786c;
    --vpdf-color-negative-500: #9e554e;
    --vpdf-color-negative-600: #7b413c;
    --vpdf-color-negative-700: #5a2f2c;
    --vpdf-color-negative-800: #3b1f1d;
    --vpdf-color-negative-900: #201111;
    --vpdf-color-negative-950: #100808;
    --vpdf-color-negative: #9e554e;
  }
</style>

<template>
  <VPdf
    :src="src"
    :smoothJump="smoothJump"
    :textLayer="textLayer"
    class="vpdf-sepia"
  />
</template>
```

Change text selection color

```html
<style>
  :root {
    /* Use solid color without opacity */
    --vpdf-textlayer-selection-bg: #3399ff;
  }
</style>
```

Change Icons

```html
<style>
  .vpdf-icons-emoji {
    --vpdf-icon-arrow_down: "⬇️";
    --vpdf-icon-arrow_up: "⬆️";
    --vpdf-icon-arrow_left: "⬅️";
    --vpdf-icon-arrow_right: "➡️";
    --vpdf-icon-arrow_drop_down: "🔻";
    --vpdf-icon-arrow_drop_up: "🔺";
    --vpdf-icon-attachment: "📎";
    --vpdf-icon-block: "🤚";
    --vpdf-icon-bookmark: "🔖";
    --vpdf-icon-close: "❌";
    --vpdf-icon-draw: "✏️";
    --vpdf-icon-error: "🚫";
    --vpdf-icon-copy: "📋";
    --vpdf-icon-gesture: "👆";
    --vpdf-icon-help: "❔";
    --vpdf-icon-image: "🖼️";
    --vpdf-icon-keyboard: "🖥️";
    --vpdf-icon-menu: "📁";
    --vpdf-icon-menu_open: "📂";
    --vpdf-icon-loader: "⌛";
    --vpdf-icon-rotate_left: "🔄";
    --vpdf-icon-rotate_right: "🔃";
    --vpdf-icon-rows: "🚥";
    --vpdf-icon-columns: "🚦";
    --vpdf-icon-warning: "⚠️";
    --vpdf-icon-zoom_in: "🔎";
    --vpdf-icon-zoom_out: "🔍";
  }
</style>

<template>
  <VPdf
    :src="src"
    :smoothJump="smoothJump"
    :textLayer="textLayer"
    class="vpdf-icons-emoji"
  />
</template>
```

Change Icon font

> The pdf viewer uses a customized icon font named `vpdf`. You can change the icon font by modifying the following CSS variables

```css
:root {
  --vpdf-icon-family: "vpdf";
  --vpdf-icon-weight: normal;
  --vpdf-icon-style: normal;
  --vpdf-icon-line-height: 1;
  --vpdf-icon-letter-spacing: normal;
  --vpdf-icon-text-transform: none;
  --vpdf-icon-display: inline-block;
  --vpdf-icon-white-space: nowrap;
  --vpdf-icon-word-wrap: normal;
  --vpdf-icon-direction: ltr;
  --vpdf-icon-font-smoothing: antialiased;
  --vpdf-icon-moz-osx-font-smoothing: grayscale;
  --vpdf-icon-text-rendering: optimizeLegibility;
  --vpdf-icon-font-feature-settings: "liga";
}
```

## Components

### VPdf

> A complete PDF viewer component with the most common features and configurations

#### Features

- Password prompt dialog
- Collapsible Side bar for navigation and attachments
  - Thumbnails
  - Bookmarks
  - Attachments (Download file only)
- View toggle (Vertical/Horizontal page scrolling)
- Rotate page
- Zoom in/out buttons
- `ctrl + scroll` to zoom in/out
- Scale selector
  - with fit to page, width and height options
- Page number indicator _(Can enter page number and jump to that page)_
- Next/Previous page buttons

#### Properties

| Property     | Type      | Default | Description                                                                                                                          |
| ------------ | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `src`        | pdfSource | -       | PDF source                                                                                                                           |
| `workerSrc`  | String    | `1.0`   | link to your custom pdf worker                                                                                                       |
| `scale`      | Number    | `1`     | The initial scale of the PDF on load<br/>`-1` => fit to page<br/>`-2` => fit to width<br/>`-3` => fit to height                      |
| `smoothJump` | Boolean   | `false` | Smooth scroll into selected page                                                                                                     |
| `textLayer`  | Boolean   | `false` | Show text layer                                                                                                                      |
| `password`   | String    | -       | Password for encrypted PDF                                                                                                           |
| `onPassword` | Function  | -       | Pass a callback function to create a custom prompt for password. <br/><br/>`VPdf` already has a built-in dialog for password prompt. |
|              |           |         |

#### sample `onPassword`

```js
const onPassword = (cb: Function, reason: Number) => {
  const password = prompt("Please enter the password");
  cb(password);
};
```

---

### VPdfViewer

> A PDF viewer component without the side & top menu bars, Use this to build/style your custom PDF viewer.

> `VPdf` uses this component internally

> [!NOTE]
> You will need to use the [`usePdf`](#usepdf) composables to use this component

> [!NOTE]
> This component uses the [`usePdfViewer`](#usepdfviewer) composable internally

#### Properties

| Property       | Type                      | Default  | Description                                                                                                                                                                                    |
| -------------- | ------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pdf`          | PDFDocumentLoadingTask    | --       | The loading task controls the operations required to load a PDF document (such as network requests) and provides a way to listen for completion, after which individual pages can be rendered. |
| `scale`        | Number                    | 1.0      | The scale/zoom factor for the PDF viewer<br/>`-1` => fit to page<br/>`-2` => fit to width<br/>`-3` => fit to height                                                                            |
| `gap`          | Number                    | 10       | The gap between pages in pixels                                                                                                                                                                |
| `rotation`     | Number                    | 0        | The rotation angle in degrees for the PDF pages. (Must be a multiple of 90)                                                                                                                    |
| `view`         | ["vertical","horizontal"] | vertical | The view mode for the PDF viewer.                                                                                                                                                              |
| `page`         | Number                    | 1        | The initial page number to display.                                                                                                                                                            |
| `textLayer`    | Boolean                   | false    | Show text layer                                                                                                                                                                                |
| `smoothJump`   | Boolean                   | false    | Smooth scroll into selected page                                                                                                                                                               |
| `renderDelay`  | Number                    | 50       | Delay in milliseconds before rendering a page                                                                                                                                                  |
| `renderOffset` | Number                    | 256      | Offset in pixels to add around the page to determine if it is visible.                                                                                                                         |
| `onProgress`   | Function                  | -        | Pass a callback function to get the loading progress.                                                                                                                                          |
|                |                           |          |

#### Exposed

| Exposed        | Type                                   | Description                                                       |
| -------------- | -------------------------------------- | ----------------------------------------------------------------- |
| `numPages`     | number                                 | The total number of pages in the PDF                              |
| `progress`     | number                                 | The loading progress of the PDF                                   |
| `pages`        | Array<pdfPageInfo>                     | Array list of pdfPageInfo                                         |
| `container`    | Size                                   | The maximum width & height of the container holding all the pages |
| `visiblePages` | Array<pdfPageInfo>                     | Array list of pdfPageInfo (Only visible Pages in the viewport)    |
| `render`       | boolean                                | Determines if the page should be rendered after scrolling         |
| `viewMode`     | "vertical" \| "horizontal"             | Scroll direction of the PDF                                       |
| `changePage`   | (page: number, offset?: Point) => void | Change the current page                                           |
| `nextPage`     | () => void                             | Uses the `changePage` to jump to the next page.                   |
| `prevPage`     | () => void                             | Uses the `changePage` to jump to the previous page.               |
| `fitWidth`     | () => void                             | Fits the current page to the width of the container               |
| `fitHeight`    | () => void                             | Fits the current page to the height of the container              |
| `fitPage`      | () => void                             | Fits the current page to the size of the container                |
|                |                                        |                                                                   |

---

### VPdfPage

> Renders a single PDF page

> [!NOTE]
> If the `pageInfo` is not supplied, you must provide the `page` property along with the `scale` and `rotation` properties, if applicable, to render a specific page..

#### Properties

| Property    | Type                       | Default | Description                                                                                                                                               |
| ----------- | -------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pageInfo`  | pdfPageInfo                | -       | An object that contains all relative information to render the page <br/><br/> Use the [`usePdfViewer`](#usepdfviewer) composable to get this information |
| `pdf`       | PDFDocumentLoadingTask     | -       | --                                                                                                                                                        |
| `textLayer` | Boolean                    | false   | Show text layer                                                                                                                                           |
| `page`      | Number                     | -       | The page number to render. If not provided, the `pageInfo` must be supplied.                                                                              |
| `scale`     | Number                     | -       | The scale/zoom factor for the page. Used only if the `pageInfo` is not supplied.                                                                          |
| `rotation`  | Number                     | -       | The rotation of the PDF. (multiple of 90). Used only if the `pageInfo` is not supplied.                                                                   |
| `render`    | Boolean                    | true    | Render the page. (Mainly used by the ['VpdfViewer'](#vpdfviewer))                                                                                         |
| `visible`   | boolean                    | true    | Whether the page is visible in the viewport or not. (Mainly used by the ['VpdfViewer'](#vpdfviewer))                                                      |
| `onRender`  | (opts: RenderArgs) => void | -       | A callback function that is called whenever the page is rendered.                                                                                         |
| `onError`   | Function                   | -       | A callback function that is called whenever an error occurs.                                                                                              |
|             |                            |         |                                                                                                                                                           |

```ts
type RenderArgs = {
  page: PDFPageProxy;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  viewport: PageViewport;
  doc: PDFDocumentProxy;
};
```

## Composables

### usePdf

> This composable is responsible for loading PDF from a source. It returns a `pdf` object that can be used to render the PDF. It also returns the number of pages, outline (bookmars), attachments, metadata, progress , and javascript of the PDF.

```ts
import { usePdf } from "@whykhamist/vpdf";

const pdf = usePdf(pdfSource, options);

const src = ref(
  "https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.7old.pdf",
);

const options = ref({
  workerSrc: "YOUR_WORKER_SRC",
  password: "PDF_PASSWORD_IF_NEEDED",
  onError: (error: any) => {},
  onProgress: (data: OnProgressParameters) => {},
  onPassword: (callback: Function, reason: any) => {},
});

const {
  pdf,
  pages,
  outline,
  attachments,
  metadata,
  progress,
  javascript,
  loading,
} = usePdf(src, options);
```

#### Parameters

| Parameter | Type                          | Description                            |
| --------- | ----------------------------- | -------------------------------------- |
| `src`     | Ref\<pdfSource\> \| pdfSource | (Required) The source of the PDF file. |
| `options` | pdfOptions                    | (Optional) The options for the PDF.    |
|           |                               |                                        |

#### Returns

| Property      | Type                   | Description                                                                           |
| ------------- | ---------------------- | ------------------------------------------------------------------------------------- |
| `pdf`         | PDFDocumentLoadingTask | The PDF object.                                                                       |
| `pages`       | Number                 | The number of pages in the PDF.                                                       |
| `outline`     | Array                  | The outline of the PDF. This contains information regarding the bookmarks in the PDF. |
| `attachments` | Object                 | The list of files attached to the document                                            |
| `metadata`    | any                    | Get the documents meta data                                                           |
| `javascript`  | Array                  | A list of embedded javascripts on the document                                        |
| `progress`    | Number                 | The loading progress of the PDF.                                                      |
| `loading`     | Boolean                | Whether the PDF is currently loading.                                                 |
|               |                        |                                                                                       |

### usePdfViewer

> This computes the page information that is needed to render and position pages in the viewport based on the scale, rotation, gaps and view mode. It alsoe determines when to render a page (virtual scrolling).

```ts
import { usePdfViewer } from "@whykhamist/vpdf";
const container = ref<HTMLDivElement>();
const pdfViewer = usePdfViewer(container, options);
```

```html
<div ref="container"></div>
```

#### Parameters

| Parameter   | Type                            | Description                                   |
| ----------- | ------------------------------- | --------------------------------------------- |
| `container` | Ref\<HTMLElement \| undefined\> | (Required) The container to render the PDF in |
| `options`   | pdfViewerOptions                | The options for the PDF.                      |
|             |                                 |                                               |

#### Parameter: options

| Property       | Type                                | Default  | Description                                                            |
| -------------- | ----------------------------------- | -------- | ---------------------------------------------------------------------- |
| `pdf`          | PDFDocumentLoadingTask              | --       |                                                                        |
| `page`         | Number                              | 1        | Initial page to display/focus.                                         |
| `scale`        | Number                              | 1        | The scale of the PDF.                                                  |
| `gap`          | Number                              | 10       | The gap (in pixels) between pages .                                    |
| `rotation`     | Number                              | 0        | The rotation of the PDF. (multiple of 90)                              |
| `view`         | String ['vertical' \| 'horizontal'] | vertical | The view mode of the PDF.                                              |
| `textLayer`    | Boolean                             | false    | Show text layer                                                        |
| `smoothJump`   | Boolean                             | false    | Smooth scroll into pages                                               |
| `renderDelay`  | Number                              | 50       | Delay in milliseconds before rendering a page                          |
| `renderOffset` | Number                              | 256      | Offset in pixels to add around the page to determine if it is visible. |
| `downScale`    | Number                              | 0.87     | Multiplied to the scale to reduce the size of the canvas.              |
|                |                                     |          |                                                                        |

#### Returns

| Property          | Type                                | Description                                                    |
| ----------------- | ----------------------------------- | -------------------------------------------------------------- |
| `totalPage`       | Number                              | The total number of pages in the PDF                           |
| `pageInfo`        | Array\<pdfPageInfo\>                | Array list of pdfPageInfo (All Pages)                          |
| `containerBounds` | Size                                | The maximum width & height of the container                    |
| `progress`        | OnProgressParameters                | The loading progress of the PDF                                |
| `render`          | Boolean                             | Determines if the page should be rendered after scrolling      |
| `currentPage`     | Number                              | The current page in focus                                      |
| `visiblePages`    | Array<pdfPageInfo>                  | Array list of pdfPageInfo (Only visible Pages in the viewport) |
| `scale`           | Number                              | The scale of the PDF                                           |
| `rotation`        | Number                              | The rotation of the PDF                                        |
| `viewMode`        | String ['vertical' \| 'horizontal'] | Scroll direction of the PDF                                    |
| `refresh`         | Function                            | Reloads the PDF                                                |
| `nextPage`        | Function                            | Uses the `changePage` to jump to the next page.                |
| `prevPage`        | Function                            | Uses the `changePage` to jump to the previous page.            |
| `changePage`      | Function                            | Jumps to a specific page with optional offset.                 |
| `fitWidth`        | Function                            | Fits the current page to the width of the container            |
| `fitHeight`       | Function                            | Fits the current page to the height of the container           |
| `fitPage`         | Function                            | Fits the current page to the size of the container             |

## Types

#### Types from `pdfjs`

- `pdfjs-dist`
  - PageViewport
- `pdfjs-dist/types/src/display/api`
  - OnProgressParameters
  - PDFDocumentLoadingTask
  - PDFDocumentProxy
  - DocumentInitParameters
  - TypedArray
  - RenderParameters

```ts
type Size = {
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

type Bounds = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type ScrollState = {
  right: boolean;
  down: boolean;
  lastX: number;
  lastY: number;
};

type pdfSource =
  | string
  | URL
  | TypedArray
  | ArrayBuffer
  | DocumentInitParameters;

interface pdfOptions {
  workerSrc?: string;
  password?: string;
  onError?: (error: any) => void;
  onProgress?: (data: OnProgressParameters) => void;
  onPassword?: (callback: Function, reason: any) => void;
}

type pdfOutlineDest = string | Array<any> | null;

type pdfOutline = Awaited<ReturnType<PDFDocumentProxy["getOutline"]>>;

type pdfOutlinePairs = {
  page: number | null;
  offsetY: number;
  offsetX: number;
  title: string;
  sub: Array<pdfOutlinePairs>;
};

type pdfViewerOptions = {
  pdf: PDFDocumentLoadingTask | undefined;
  page: number;
  scale: number;
  gap: number;
  rotation: number;
  view: "vertical" | "horizontal";
  textLayer: boolean;
  smoothJump: boolean;
  renderDelay: number;
  renderOffset: number;
  downScale?: number;
};

type pdfPageInfo = {
  id: string;
  scale: number;
  rotation: number;
  page: number;
  viewport: PageViewport;
  pos: Point;
  bounds: pdfPageBounds;
};

type pdfPageBounds = {
  inner: Bounds;
  outer: Bounds;
};

type pdfScrollState = {
  rAF: number | null;
  state: ScrollState;
  covered: Point;
  timer: ReturnType<typeof setTimeout> | null;
};

type pdfattachmentFile = {
  filename: string;
  content: TypedArray;
  rawFilename: string;
};

type pdfattachment = Record<string, pdfattachmentFile>;
```
