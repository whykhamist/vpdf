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
  "https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.7old.pdf"
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
  --vpdf-foreground: 213deg 13% 14%;
  --vpdf-background: 0deg 0% 100%;
  --vpdf-primary: 211deg 32% 26%;
  --vpdf-secondary: 211deg 46% 69%;
  --vpdf-accent: 211deg 62% 44%;

  --vpdf-positive: 125deg 42% 50%;
  --vpdf-negative: 3deg 75% 60%;
}

.vpdf-dark {
  --vpdf-foreground: 213deg 26% 82%;
  --vpdf-background: 215deg 18% 13%;
  --vpdf-primary: 211deg 32% 74%;
  --vpdf-secondary: 211deg 46% 31%;
  --vpdf-accent: 211deg 62% 56%;
}
```

We can also add our custom colors

```html
<style lang="scss">
  .vpdf-sepia {
    --vpdf-foreground: 34 33% 20%;
    --vpdf-background: 42 54% 88%;
    --vpdf-primary: 34 20% 51%;
    --vpdf-secondary: 60 19% 73%;
    --vpdf-accent: 75 19% 63%;
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
| `smoothJump` | Boolean   | false   | Smooth scroll into selected page                                                                                                     |
| `textLayer`  | Boolean   | false   | Show text layer                                                                                                                      |
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
| `scale`        | Number                    | 1.0      | The scale/zoom factor for the PDF viewer                                                                                                                                                       |
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

---

### VPdfPageRenderer

> Renders a single PDF page

#### Properties

| Property    | Type                   | Default | Description                                                                                                                                               |
| ----------- | ---------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pageInfo`  | pdfPageInfo            | -       | An object that contains all relative information to render the page <br/><br/> Use the [`usePdfViewer`](#usepdfviewer) composable to get this information |
| `pdf`       | PDFDocumentLoadingTask | -       | --                                                                                                                                                        |
| `textLayer` | Boolean                | false   | Show text layer                                                                                                                                           |
| `render`    | Boolean                | false   | Render the page                                                                                                                                           |
| `onRender`  | Function               | -       | A callback function that is called whenever the page is rendered.                                                                                         |
| `onError`   | Function               | -       | A callback function that is called whenever an error occurs.                                                                                              |
|             |                        |         |

#### Exposed

| Property  | Type                     | Default | Description        |
| --------- | ------------------------ | ------- | ------------------ |
| `context` | CanvasRenderingContext2D | -       | The canvas context |
| `canvas`  | HTMLCanvasElement        | -       | The canvas element |
|           |                          |         |                    |

## Composables

### usePdf

> This composable is responsible for loading PDF from a source. It returns a `pdf` object that can be used to render the PDF. It also returns the number of pages, outline (bookmars), attachments, metadata, progress , and javascript of the PDF.

```ts
import { usePdf } from "@whykhamist/vpdf";

const pdf = usePdf(pdfSource, options);

const src = ref(
  "https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.7old.pdf"
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
