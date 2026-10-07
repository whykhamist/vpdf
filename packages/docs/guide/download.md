# Download and save

Built-in `vpdf.download` adds a toolbar control. It downloads the original file, or saves a modified PDF when `state.hasModifications` is true.

## Controller

```ts
await controller.downloadOriginal("report.pdf");
const bytes = await controller.saveModified("report-annotated.pdf");
```

`saveModified` returns a `Uint8Array` from PDF.js `saveDocument` (or `getData()` if `saveDocument` is missing). It **always** triggers a browser download. The filename defaults to the document name when omitted. The toolbar button calls `saveModified()` with no arguments.

Disable with `toolbar.download: false` or `plugins.enabled['vpdf.download'] = false`.

Core does not upload anywhere. Send the returned bytes to your API if you need persistence.
