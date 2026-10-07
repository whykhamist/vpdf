# Plugin events

Plugins subscribe with `ctx.on(event, handler)` and notify the bus with `ctx.emit(event, ...args)`. Event names are the keys of [`VPdfPluginEvents`](/plugins/types/#vpdfpluginevents). There is no API for custom event strings; TypeScript only accepts those keys.

```ts
const dispose = ctx.on("onPageChange", ({ pageNumber, pageCount }) => {
  console.log(pageNumber, pageCount);
});
```

`dispose()` unsubscribes. Plugin deactivate also unsubscribes handlers registered through `ctx.on`.

Handlers run synchronously in registration order. A throwing handler is logged as `[vpdf] plugin event handler error (<event>)` and does not stop later handlers.

## Event reference

| Event | Payload | When it fires |
| --- | --- | --- |
| `onDocumentLoad` | `{ pageCount: number }` | Engine load state becomes `ready` |
| `onReady` | — | After the document is shown (follows `onDocumentLoad` on a successful load) |
| `onDocumentClose` | — | Engine `closeDocument()` while the plugin is still active |
| `onPageChange` | `{ pageNumber, pageCount }` | Current page or page count changes |
| `onScaleChange` | `{ scale, preset?: string }` | Zoom changes |
| `onPassword` | [`VPdfPasswordRequest`](/guide/types#vpdfpasswordrequest) (`reason`, `submit`, `cancel`) | Password required or incorrect |
| `onProgress` | `{ loaded, total }` | Load progress |
| `onError` | `{ code, message, cause? }` | Load / engine error |
| `onAnnotationChange` | `{ type, editorMode, pageNumber?, raw? }` | Annotation added, updated, removed, or committed |
| `onAttachmentDownload` | `{ attachment, download }` | Attachments plugin, when `allowAttachmentDownload === false` |
| `onPrepareDocumentInit` | `{ params, context }` | Just before `pdfjs.getDocument()`, so plugins can mutate `params` |

`onPageChange` / `onScaleChange` / `onProgress` / `onAnnotationChange` fire **every time** the engine reports them, including repeated navigation. `onDocumentLoad` / `onReady` fire once per successful load.

`onDocumentClose` fires when the document is closed with `controller.close()` or replaced by a new `load()`, while the plugin is still active. Viewer `destroy()` calls `plugins.dispose()` first, which clears handlers, then closes the engine. Plugin `onDocumentClose` handlers do **not** run on viewer teardown. See [Lifecycle](/plugins/lifecycle).

Most of these are emitted by `useVPdfViewer` from engine callbacks. Plugins do not need to emit them. `onAttachmentDownload` is the built-in exception: the attachments plugin emits it. `onPrepareDocumentInit` is emitted through `PluginManager.prepareDocumentInit`.

## `onPrepareDocumentInit`

Fires with a mutable `params` draft for `pdfjs.getDocument()` and `{ source, password? }`.

```ts
ctx.on("onPrepareDocumentInit", ({ params, context }) => {
  params.httpHeaders = {
    ...(params.httpHeaders as Record<string, string> | undefined),
    Authorization: "Bearer plugin",
  };
});
```

The engine restores reserved fields after plugins run (`url` / `data` / `password` / `worker`, plus `isEvalSupported` / `enableScripting` from feature flags). Plugins can set headers and similar fetch options. They cannot change the source URL or force scripting on. See [Security](/guide/security) and [Sources](/guide/sources).

## `ctx.emit()`

Use `emit` so the host and other plugins can subscribe to a **typed** viewer event your plugin is responsible for.

```ts
ctx.emit("onAttachmentDownload", {
  attachment,
  download: () => saveAttachment(ctx, id, filename),
});
```

The attachments built-in emits `onAttachmentDownload` when `options.allowAttachmentDownload === false`, so the host can confirm before `download()` runs. `VPdfViewer` forwards that event as `attachmentDownload`.

Custom names such as `"my-plugin:done"` are not in `VPdfPluginEvents` and will not type-check. Coordinate through plugin state, `ctx.state`, or a host callback in `props` instead.

Other plugins subscribe the same way the host does: `ctx.on("onAttachmentDownload", handler)`. All handlers share one manager-wide bus.

```ts
// Producer plugin
setup(ctx) {
  async function requestDownload(id: string, filename: string) {
    if (ctx.options.value.allowAttachmentDownload !== false) {
      await save(id, filename);
      return;
    }
    ctx.emit("onAttachmentDownload", {
      attachment: { id, filename },
      download: () => save(id, filename),
    });
  }
}

// Consumer plugin (or host via VPdfViewer @attachmentDownload)
setup(ctx) {
  return ctx.on("onAttachmentDownload", ({ attachment, download }) => {
    if (window.confirm(`Save ${attachment.filename}?`)) void download();
  });
}
```

## Cleanup

```ts
setup(ctx) {
  const disposeReady = ctx.on("onReady", () => {
    console.info("ready", ctx.state.value.pageCount);
  });
  const disposeClose = ctx.on("onDocumentClose", () => {
    ctx.closeModal();
  });

  return () => {
    disposeReady();
    disposeClose();
  };
}
```

Returning those disposers is optional; deactivate unsubscribes `ctx.on` handlers automatically. Call them yourself to stop listening while the plugin stays active.
