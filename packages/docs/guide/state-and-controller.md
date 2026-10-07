# State and controller

`VPdfViewer` exposes `state` and `controller`. `useVPdfViewer` returns the same pair. State is a Vue ref; `controller.getState()` returns a readonly snapshot.

## Load states

[`VPdfLoadState`](/guide/types#vpdfloadstate): `idle | loading | password | ready | error | unsupported`

| State | Meaning |
| --- | --- |
| `idle` | Nothing loaded |
| `loading` | Fetch / parse in progress |
| `password` | Waiting on `state.password.submit` / `cancel` |
| `ready` | Pages can render |
| `error` | See `state.error` |
| `unsupported` | Pure XFA with `features.xfa: false` |

## Viewer state

[`VPdfViewerState`](/guide/types#vpdfviewerstate) fields:

| Field | Notes |
| --- | --- |
| `pageNumber` / `pageCount` | 1-based page |
| `scale` / `scalePreset` | Numeric scale and optional fit preset |
| `rotation` | `0 \| 90 \| 180 \| 270` |
| `sidebar` | Current sidebar panel |
| `annotationEditorMode` | Active editor tool |
| `annotationEditor` | Selection, params, `isEditing` |
| `search` | Query, match index, flags, status |
| `progress` | `{ loaded, total }` |
| `error` | `{ code, message, cause? }` |
| `password` | `{ reason: 'need' \| 'incorrect', submit, cancel }` |
| `outline` | PDF outline tree |
| `attachments` | Embedded files |
| `meta` | Title, author, page count, `isPureXfa`, fingerprint, … |
| `hasModifications` | True after native editor changes that PDF.js can save |

## Error codes

| Code | Typical cause |
| --- | --- |
| `SOURCE_INVALID` | Unsupported `VPdfSource` |
| `LOAD_FAILED` | Network or parse failure |
| `XFA_UNSUPPORTED` | Pure XFA while `features.xfa` is false |

## Controller

[`VPdfViewerController`](/guide/types#vpdfviewercontroller) methods:

| Method | Role |
| --- | --- |
| `load(source, password?, documentInit?)` | Open a document. Third argument is per-load PDF.js options. See [Sources](/guide/sources#authentication-and-custom-headers). |
| `close()` | Unload and reset |
| `goToPage` / `nextPage` / `previousPage` | Pagination |
| `goToDestination(dest)` | Outline / internal dest |
| `setScale` / `zoomIn` / `zoomOut` | Zoom |
| `rotate(delta?)` | Default `+90` |
| `setSidebar(panel)` | Open or close the sidebar |
| `setAnnotationEditorMode` | Tool selection |
| `updateAnnotationEditor` / `deleteSelectedAnnotation` | Editor params / delete |
| `find` / `findNext` / `findPrevious` / `clearFind` | Search |
| `downloadOriginal(filename?)` | Original bytes |
| `saveModified(filename?)` | Returns `Uint8Array` and always triggers a browser download |
| `getDocument()` | PDF.js `PDFDocumentProxy` or `undefined` |
| `getPage(n)` | PDF.js page proxy |
| `getPageGeometry(n)` | Viewport size, scale, rotation, transform |
| `getState()` | Snapshot |
| `getExperimentalViewer()` | PDF.js `PDFViewer`. **Not stable.** |

`getExperimentalViewer()` is an escape hatch for packages such as page-layout. Prefer the controller in application code.
