# Sidebar

Three built-in plugins register sidebar panels:

| Plugin id | Panel id | Feature flag | Content |
| --- | --- | --- | --- |
| `vpdf.thumbnails` | thumbnails | `features.thumbnails` | Page previews; XFA pages use HTML unless [XFA thumbnail raster](/plugins/xfa-thumbnail-raster) is registered |
| `vpdf.outline` | outline | `features.outline` | Document outline; destinations call `goToDestination` |
| `vpdf.attachments` | attachments | `features.attachments` | Embedded files; click downloads unless gated below |

When `options.sidebar` is omitted, the initial panel is `'thumbnails'` on viewports wider than 1024px and `'none'` (closed) at 1024px and below. Pass `'thumbnails'`, `'outline'`, `'attachments'`, `'plugins'`, or `'none'` to override. `controller.setSidebar('outline')` opens a panel at runtime.

Disable one built-in plugin to remove only its tab. See [Features and toolbar](/guide/features#built-in-plugins-honor-both).

Plugin panels registered with `ctx.registerPanel` appear as extra tabs. Selecting one sets sidebar to `'plugins'` internally.

On viewports ≤1024px the sidebar becomes an overlay. It starts closed at those widths so the overlay does not cover the document until the sidebar toggle is used.

## Thumbnails

`thumbnailColumns` (default `2`) becomes `--vpdf-thumb-cols` on the root.

Non-XFA pages render with PDF.js onto a canvas. Pure XFA pages default to an inert HTML preview in `.vpdf-thumb-xfa`. Register `@whykhamist/vpdf-plugin-xfa-thumbnail-raster` to snapshot that HTML with html2canvas.

## Outline

Outline items support nested `items`, bold/italic, and destination or URL targets. The tree is keyboard-accessible.

## Attachments

Each attachment has `id`, `filename`, optional `contentType`, `description`, and `size`. Sizes may hydrate asynchronously after load.

`allowAttachmentDownload` defaults to **true**. Set it to `false` to require host confirmation. Clicks then emit `attachmentDownload` on `<VPdfViewer>` (and `onAttachmentDownload` on the plugin bus) with `{ attachment, download }`. Call `download()` after the user confirms. With no listener, the click does nothing.

```vue
<VPdfViewer
  :options="{ allowAttachmentDownload: false }"
  @attachment-download="onAttachmentDownload"
/>
```

```ts
async function onAttachmentDownload({
  attachment,
  download,
}: {
  attachment: { filename: string };
  download: () => Promise<void>;
}) {
  if (window.confirm(`Download ${attachment.filename}?`)) {
    await download();
  }
}
```

In-page PDF.js FileAttachment annotations are a separate download path and are not gated by this flag. Treat attachments as untrusted binaries; see [Security](/guide/security).
