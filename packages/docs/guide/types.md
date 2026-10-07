# Type reference

Field-by-field catalog of public TypeScript types named in this documentation. Import from `@whykhamist/vpdf` unless a section names another package.

For behavior, defaults, and examples, follow the linked guide pages.

Plugin and extension types are in the [Plugin type reference](/plugins/types/) (including per-package pages under `/plugins/types/`).

## Viewer config

### VPdfSource

Document input accepted by the viewer and `controller.load()`. See [Sources](/guide/sources).

```ts
type VPdfSource =
  | string
  | File
  | Blob
  | URL
  | ArrayBuffer
  | Uint8Array;
```

| Kind | Description |
| --- | --- |
| `string` | URL loaded by PDF.js |
| `URL` | Same as string (`href`) |
| `File` / `Blob` | Object URL for PDF.js; revoked on `close()` |
| `ArrayBuffer` / `Uint8Array` | Binary data |

### VPdfViewerOptions

Passed to `<VPdfViewer :options>` or `useVPdfViewer`. See [Options](/guide/options).

| Property | Type | Description |
| --- | --- | --- |
| `src` | `VPdfSource` | Initial document; `src` prop wins when both are set |
| `password` | `string` | Initial password for encrypted PDFs |
| `scale` | `number \| 'page-width' \| 'page-height' \| 'page-fit' \| 'page-actual' \| 'auto'` | Zoom level or fit preset; default `1` |
| `rotation` | `0 \| 90 \| 180 \| 270` | On options/state; engine does not apply as initial rotation — use `controller.rotate()` after load |
| `locale` | `string` | Locale for document-properties date formatting |
| `features` | `VPdfFeatureFlags` | Engine capabilities |
| `toolbar` | `VPdfToolbarFeatures \| false` | Built-in toolbar flags, or `false` to hide the toolbar |
| `sidebar` | `VPdfSidebarPanel` | Initial sidebar panel |
| `assets` | `VPdfAssetUrls` | Worker, CMaps, fonts, WASM, image paths |
| `externalLinks` | `VPdfExternalLinkOptions` | External PDF link behavior |
| `allowAttachmentDownload` | `boolean` | Default `true`. When `false`, emits `attachmentDownload` / `onAttachmentDownload` |
| `annotationEditorMode` | `VPdfAnnotationEditorMode` | Initial PDF.js editor tool |
| `smoothJump` | `boolean` | Animated page jumps; default `false` |
| `pageGap` | `number` | Space between pages at 100% scale (px); default `10` |
| `pageRadius` | `number` | Page corner radius at 100% scale (px); default `10`; `0` = square |
| `destinationOffset` | `number` | Top inset when jumping to destinations (px); default `20` |
| `thumbnailColumns` | `number` | Thumbnail grid columns; integer ≥ 1; default `2` |
| `documentInit` | `VPdfDocumentInitOptions` | Extra PDF.js `getDocument` options |
| `class` | `string` | Extra class on `.vpdf-root` |

### VPdfFeatureFlags

See [Features and toolbar](/guide/features).

| Property | Type | Description |
| --- | --- | --- |
| `textLayer` | `boolean` | PDF.js text layer (needed for search highlights) |
| `annotationLayer` | `boolean` | Form / annotation display layer |
| `xfa` | `boolean` | XFA support; pure XFA without this becomes `unsupported` |
| `search` | `boolean` | Find engine |
| `thumbnails` | `boolean` | Built-in thumbnails panel |
| `outline` | `boolean` | Built-in outline panel |
| `attachments` | `boolean` | Built-in attachments panel |
| `annotations` | `boolean` | Native annotation editors |
| `scripting` | `boolean` | PDF JavaScript; **off by default** |

### VPdfToolbarFeatures

Per built-in toolbar control. See [Features and toolbar](/guide/features).

| Property | Type | Description |
| --- | --- | --- |
| `download` | `boolean` | Download control |
| `search` | `boolean` | Search toggle and find bar |
| `zoom` | `boolean` | Zoom controls |
| `rotate` | `boolean` | Rotate control |
| `pageNav` | `boolean` | Page navigation |
| `sidebar` | `boolean` | Sidebar toggle |
| `annotations` | `boolean` | Annotation editor toolbar |
| `documentProperties` | `boolean` | Document properties |

### VPdfAssetUrls

See [Assets and workers](/guide/assets).

| Property | Type | Description |
| --- | --- | --- |
| `workerSrc` | `string` | URL to `pdf.worker.min.mjs` matching installed `pdfjs-dist` |
| `cMapUrl` | `string` | Base URL for CMap files |
| `standardFontDataUrl` | `string` | Base URL for standard fonts |
| `wasmUrl` | `string` | Base URL for WASM assets |
| `imageResourcesPath` | `string` | Base URL for annotation/editor images |

### VPdfExternalLinkOptions

| Property | Type | Description |
| --- | --- | --- |
| `enabled` | `boolean` | Whether external PDF links open |
| `target` | `'_blank' \| '_self'` | Link target |
| `rel` | `string` | Link `rel` attribute (default includes `noopener noreferrer nofollow`) |

### VPdfDocumentInitOptions

PDF.js `getDocument` options hosts may set on the viewer or `load()`. Omits `url`, `data`, `password`, `worker` (reserved by vpdf) and class-instance keys. See [Sources](/guide/sources#authentication-and-custom-headers).

Typical fields: `httpHeaders`, `withCredentials`, range flags, and other `DocumentInitParameters` from PDF.js. `enableScripting` and `isEvalSupported` are overwritten after merge per [Security](/guide/security).

### VPdfSidebarPanel

```ts
type VPdfSidebarPanel =
  | "none"
  | "thumbnails"
  | "outline"
  | "attachments"
  | "plugins";
```

### VPdfPluginsConfig

See [Plugin type reference — VPdfPluginsConfig](/plugins/types/#vpdfpluginsconfig).

## State

### VPdfViewerState

Reactive viewer state (`ctx.state`, component ref). See [State and controller](/guide/state-and-controller).

| Property | Type | Description |
| --- | --- | --- |
| `loadState` | `VPdfLoadState` | Document lifecycle |
| `pageNumber` | `number` | Current page (1-based) |
| `pageCount` | `number` | Total pages |
| `scale` | `number` | Numeric zoom |
| `scalePreset` | `string` | Active fit preset when zoom is not numeric |
| `rotation` | `0 \| 90 \| 180 \| 270` | Page rotation |
| `sidebar` | `VPdfSidebarPanel` | Open sidebar panel |
| `annotationEditorMode` | `VPdfAnnotationEditorMode` | Active editor tool |
| `annotationEditor` | `VPdfAnnotationEditorUi` | Editor UI snapshot |
| `search` | `VPdfSearchState` | Find state |
| `progress` | `VPdfProgressEvent` | Load progress |
| `error` | `VPdfErrorEvent` | Present when `loadState === 'error'` |
| `password` | `VPdfPasswordRequest` | Present when `loadState === 'password'` |
| `outline` | `VPdfOutlineItem[]` | PDF outline tree |
| `attachments` | `VPdfAttachment[]` | Embedded files |
| `meta` | `VPdfDocumentMeta` | Document metadata |
| `hasModifications` | `boolean` | Unsaved native editor changes |

### VPdfLoadState

```ts
type VPdfLoadState =
  | "idle"
  | "loading"
  | "password"
  | "ready"
  | "error"
  | "unsupported";
```

### VPdfSearchState

See [Search](/guide/search).

| Property | Type | Description |
| --- | --- | --- |
| `query` | `string` | Current find string |
| `matchCount` | `number` | Total matches |
| `currentMatch` | `number` | Active match index |
| `caseSensitive` | `boolean` | Case-sensitive find |
| `entireWord` | `boolean` | Whole-word match |
| `highlightAll` | `boolean` | Highlight all matches |
| `matchDiacritics` | `boolean` | Diacritic-sensitive match |
| `findPrevious` | `boolean` | Search direction |
| `status` | `'idle' \| 'pending' \| 'found' \| 'not-found' \| 'wrapped'` | Find status |

### VPdfPasswordRequest

| Property | Type | Description |
| --- | --- | --- |
| `reason` | `VPdfPasswordReason` | `'need'` or `'incorrect'` |
| `submit` | `(password: string) => void` | Supply password |
| `cancel` | `() => void` | Cancel password flow |

### VPdfPasswordReason

```ts
type VPdfPasswordReason = "need" | "incorrect";
```

### VPdfProgressEvent

| Property | Type | Description |
| --- | --- | --- |
| `loaded` | `number` | Bytes loaded |
| `total` | `number` | Total bytes (when known) |

### VPdfErrorEvent

| Property | Type | Description |
| --- | --- | --- |
| `code` | `string` | Error code (e.g. `SOURCE_INVALID`, `LOAD_FAILED`, `XFA_UNSUPPORTED`) |
| `message` | `string` | Human-readable message |
| `cause` | `unknown` | Optional underlying error |

### VPdfDocumentMeta

| Property | Type | Description |
| --- | --- | --- |
| `title` | `string` | Document title |
| `author` | `string` | Author |
| `subject` | `string` | Subject |
| `keywords` | `string` | Keywords |
| `creator` | `string` | Creating application |
| `producer` | `string` | PDF producer |
| `creationDate` | `string` | Creation date string |
| `modificationDate` | `string` | Modification date string |
| `pageCount` | `number` | Page count |
| `isPureXfa` | `boolean` | Pure XFA document |
| `fingerprint` | `string` | Document fingerprint |

### VPdfOutlineItem

Recursive PDF bookmark entry.

| Property | Type | Description |
| --- | --- | --- |
| `title` | `string` | Bookmark label |
| `bold` | `boolean` | Bold style |
| `italic` | `boolean` | Italic style |
| `color` | `Uint8ClampedArray` | RGB color |
| `dest` | `string \| unknown[]` | Internal destination |
| `url` | `string` | External URL |
| `unsafeUrl` | `string` | Unsafe URL variant |
| `newWindow` | `boolean` | Open in new window |
| `count` | `number` | Child count hint |
| `items` | `VPdfOutlineItem[]` | Nested bookmarks |

### VPdfAttachment

| Property | Type | Description |
| --- | --- | --- |
| `id` | `string` | Attachment id for download |
| `filename` | `string` | Display / save name |
| `contentType` | `string` | MIME type |
| `description` | `string` | Description |
| `size` | `number` | Size in bytes |

### VPdfAnnotationEditorUi

| Property | Type | Description |
| --- | --- | --- |
| `isEditing` | `boolean` | Editor session active |
| `hasSelection` | `boolean` | Annotation selected |
| `editorType` | `VPdfAnnotationEditorKind` | Active editor kind |
| `params` | `VPdfAnnotationEditorParams` | Current editor parameters |

### VPdfAnnotationEditorParams

| Property | Type | Description |
| --- | --- | --- |
| `color` | `string` | CSS color |
| `fontSize` | `number` | Free text font size |
| `thickness` | `number` | Stroke / highlight thickness |
| `opacity` | `number` | Ink opacity |

## Controller and composable

### VPdfViewerController

Imperative API from `<VPdfViewer>` ref or `useVPdfViewer`. See [State and controller](/guide/state-and-controller).

| Member | Signature | Description |
| --- | --- | --- |
| `load` | `(source, password?, documentInit?) => Promise<void>` | Open a document |
| `close` | `() => Promise<void>` | Unload and reset |
| `goToPage` | `(pageNumber) => void` | Go to page |
| `nextPage` | `() => void` | Next page |
| `previousPage` | `() => void` | Previous page |
| `goToDestination` | `(dest) => Promise<void>` | Outline / internal link destination |
| `setScale` | `(scale: number \| string) => void` | Set zoom or preset |
| `zoomIn` | `(step?) => void` | Zoom in |
| `zoomOut` | `(step?) => void` | Zoom out |
| `rotate` | `(delta?: 90 \| -90) => void` | Rotate pages; default `+90` |
| `setSidebar` | `(panel: VPdfSidebarPanel) => void` | Open sidebar panel |
| `setAnnotationEditorMode` | `(mode) => void` | Select editor tool |
| `updateAnnotationEditor` | `(patch) => void` | Update editor params |
| `deleteSelectedAnnotation` | `() => void` | Delete selected annotation |
| `find` | `(options: VPdfFindOptions) => void` | Start or update find |
| `findNext` | `() => void` | Next match |
| `findPrevious` | `() => void` | Previous match |
| `clearFind` | `() => void` | Clear find |
| `downloadOriginal` | `(filename?) => Promise<void>` | Download original bytes |
| `saveModified` | `(filename?) => Promise<Uint8Array>` | Save modified PDF; also triggers download |
| `getDocument` | `() => PDFDocumentProxy \| undefined` | PDF.js document |
| `getPage` | `(n) => Promise<PDFPageProxy \| undefined>` | PDF.js page |
| `getPageGeometry` | `(n) => VPdfPageGeometry \| undefined` | Rendered viewport |
| `getState` | `() => Readonly<VPdfViewerState>` | State snapshot |
| `getExperimentalViewer` | `() => unknown` | PDF.js `PDFViewer`; **unstable** |

### VPdfFindOptions

See [Search](/guide/search).

| Property | Type | Description |
| --- | --- | --- |
| `query` | `string` | Find string |
| `caseSensitive` | `boolean` | Case-sensitive |
| `entireWord` | `boolean` | Whole word |
| `highlightAll` | `boolean` | Highlight all matches |
| `matchDiacritics` | `boolean` | Match diacritics |
| `findPrevious` | `boolean` | Search backward |
| `type` | `VPdfFindEventType` | PDF.js find event type |

### VPdfFindEventType

```ts
type VPdfFindEventType =
  | ""
  | "again"
  | "highlightallchange"
  | "casesensitivitychange"
  | "entirewordchange"
  | "diacriticmatchingchange";
```

### VPdfPageGeometry

On-screen page viewport from the rendered PDF.js page view.

| Property | Type | Description |
| --- | --- | --- |
| `pageNumber` | `number` | 1-based page number |
| `width` | `number` | Viewport width |
| `height` | `number` | Viewport height |
| `scale` | `number` | Scale factor |
| `rotation` | `number` | Rotation in degrees |
| `transform` | `number[]` | PDF.js viewport transform matrix |

### useVPdfViewer parameters and return

Not exported as named types. See [useVPdfViewer](/guide/use-vpdf-viewer).

**Parameters**

| Field | Type | Description |
| --- | --- | --- |
| `options` | `Ref<VPdfViewerOptions>` | Viewer options ref |
| `plugins` | `VPdfPluginsConfig` | Optional plugin config |

**Return**

| Field | Type | Description |
| --- | --- | --- |
| `state` | `Readonly<Ref<VPdfViewerState>>` | Viewer state |
| `mutableState` | `Ref<VPdfViewerState>` | Writable state (prefer controller) |
| `options` | `Ref<VPdfViewerOptions>` | Options ref passed in |
| `controller` | `VPdfViewerController` | Controller |
| `plugins` | `PluginManager` | Plugin manager |
| `containerRef` | `Ref<HTMLElement>` | Optional container ref |
| `resolvedToolbar` | computed | Merged toolbar defaults |
| `resolvedFeatures` | computed | Merged feature defaults |
| `mount` | `(el: HTMLElement) => Promise<void>` | Attach PDF.js to DOM |
| `destroy` | `() => void` | Tear down plugins and engine |
| `ensureMounted` | `() => Promise<void>` | Used internally by `load` |

## Annotations and UI

### VPdfAnnotationEditorMode

See [Annotations](/guide/annotations).

```ts
type VPdfAnnotationEditorMode =
  | "none"
  | "freetext"
  | "highlight"
  | "ink"
  | "stamp";
```

### VPdfAnnotationEditorKind

```ts
type VPdfAnnotationEditorKind = Exclude<VPdfAnnotationEditorMode, "none">;
```

### VPdfAnnotationEditorProps

Props for a custom inline editor component passed to `VpdfAnnotationsPlugin({ editorComponent })`.

| Property | Type | Description |
| --- | --- | --- |
| `editorType` | `VPdfAnnotationEditorKind` | Active tool |
| `params` | `VPdfAnnotationEditorParams` | Current params |
| `canDelete` | `boolean` | Whether delete is allowed |
| `actions` | `VPdfAnnotationEditorActions` | Update and delete |

### VPdfAnnotationEditorActions

| Member | Signature | Description |
| --- | --- | --- |
| `update` | `(patch: VPdfAnnotationEditorParams) => void` | Apply param patch |
| `deleteSelected` | `() => void` | Delete selection |

### VPdfUiSlot

Replaceable viewer primitive slots. See [UI components](/guide/ui).

```ts
type VPdfUiSlot =
  | "button"
  | "input"
  | "select"
  | "checkbox"
  | "dropdownMenu"
  | "card"
  | "modal";
```

### VPdfUiComponents

```ts
type VPdfUiComponents = Record<VPdfUiSlot, Component>;
```

Map each slot to a Vue component. Pass `Partial<VPdfUiComponents>` on `<VPdfViewer :ui>`.

### VPdfIconSlot

Named icon slots for toolbar and sidebar. See [Icons](/guide/icons) for `VPDF_ICON_SLOTS`.

Union of string literals such as `sidebar`, `search`, `download`, `print`, etc.

Icon renderer types: [Plugin type reference](/plugins/types/#vpdficonrenderer).
