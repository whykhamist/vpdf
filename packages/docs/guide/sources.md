# Sources

[`VPdfSource`](/guide/types#vpdfsource) is:

```ts
type VPdfSource = string | File | Blob | URL | ArrayBuffer | Uint8Array;
```

| Kind | Behavior |
| --- | --- |
| `string` | Treated as a URL and loaded by PDF.js |
| `URL` | Same as string (`href`) |
| `File` / `Blob` | Object URL created for PDF.js, revoked on close |
| `ArrayBuffer` / `Uint8Array` | Loaded as binary data |

Invalid sources fail with `SOURCE_INVALID`.

For large files, pass a **URL** so PDF.js can fetch byte ranges and render before the whole file arrives. `File`, `Blob`, and typed arrays are already fully in memory.

See [Host PDFs](/examples/host-pdfs) for range requests, CORS, and authenticated endpoints.

## Authentication and custom headers {#authentication-and-custom-headers}

`url` and `data` always come from `src` / `controller.load(source)`. PDF.js fetch options go on `documentInit` ([`VPdfDocumentInitOptions`](/guide/types#vpdfdocumentinitoptions)).

Set them on the viewer for every load:

```vue
<VPdfViewer
  src="https://files.example.com/report.pdf"
  :options="{
    documentInit: {
      withCredentials: true,
      httpHeaders: {
        Authorization: `Bearer ${token}`,
      },
    },
  }"
/>
```

Or pass a per-load override. It is assigned on top of `options.documentInit`; `httpHeaders` objects are merged:

```ts
await viewer.controller.load("/api/documents/report.pdf", undefined, {
  withCredentials: true,
  httpHeaders: { Authorization: `Bearer ${token}` },
});
```

Plugins can mutate the same draft before `getDocument()`:

```ts
{
  id: "auth-headers",
  setup(ctx) {
    return ctx.on("onPrepareDocumentInit", ({ params }) => {
      params.httpHeaders = Object.assign({}, params.httpHeaders, {
        Authorization: `Bearer ${getToken()}`,
      });
    });
  },
}
```

Merge order:

1. Viewer `options.documentInit`
2. `controller.load(..., documentInit)` (assigned on top; `httpHeaders` merged)
3. Plugin `onPrepareDocumentInit`
4. vpdf lock: reserved `url` / `data` / `password` restored, `worker` removed, `isEvalSupported: false`, `enableScripting` from `features.scripting`

Plugins can set headers and similar fetch options. They cannot change the source URL or force scripting on. Class-instance PDF.js options such as `range` (custom range transport) are not on `documentInit`; set them from `onPrepareDocumentInit`.

Credentialed cross-origin requests need `Access-Control-Allow-Credentials: true` and a specific `Access-Control-Allow-Origin` (not `*`). Custom headers must be listed in `Access-Control-Allow-Headers`.

## Filename

Downloads use the source filename when the source is a `File`. URL sources use the last path segment when it looks like a PDF name. `downloadOriginal` and `saveModified` also accept an explicit filename.

## Replacing the document

```ts
await viewer.controller.load(file);
await viewer.controller.close();
```

`options.src` and the `src` prop are watched. Changing them loads the new source. The previous document is closed and worker memory is cleaned up.

See [Load files and blobs](/examples/load-files) for a host file picker.
