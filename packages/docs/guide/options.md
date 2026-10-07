# Options

Pass [`VPdfViewerOptions`](/guide/types#vpdfvieweroptions) to `<VPdfViewer :options="…">` or to `useVPdfViewer`.

## Fields

| Field | Default | Notes |
| --- | --- | --- |
| `src` | — | Also available as the `src` prop (prop wins) |
| `password` | — | Initial password for encrypted files |
| `scale` | `1` | Number, or `'page-width' \| 'page-height' \| 'page-fit' \| 'page-actual' \| 'auto'` |
| `rotation` | `0` | Present on options and state. The engine does not apply `options.rotation` as initial page rotation. Use `controller.rotate()` after load. |
| `locale` | runtime locale | Used when formatting document-properties dates |
| `features` | see [features](/guide/features#feature-defaults) | Engine capabilities |
| `toolbar` | see [defaults](/guide/features#toolbar-defaults) | Per-control flags, or `false` to hide the toolbar |
| `sidebar` | `'thumbnails'` if viewport > 1024px, else `'none'` | Initial panel: `none \| thumbnails \| outline \| attachments \| plugins` |
| `assets` | resolved fallbacks | Worker, CMaps, fonts, WASM, images |
| `externalLinks` | enabled, `_blank`, `noopener noreferrer nofollow` | PDF link behavior |
| `annotationEditorMode` | `'none'` | Initial PDF.js editor mode |
| `smoothJump` | `false` | Animated page jumps; skipped when virtual scroll is active |
| `pageGap` | `10` | Pixels between pages at 100% scale; `0` is flush |
| `pageRadius` | `10` | Page corner radius; `0` is square (no border/shadow) |
| `destinationOffset` | `20` | Top inset when jumping via outline, in-document links, or search matches |
| `thumbnailColumns` | `2` | Integer `>= 1` |
| `documentInit` | — | PDF.js `getDocument` options (`httpHeaders`, `withCredentials`, …). See [Sources](/guide/sources#authentication-and-custom-headers) |
| `class` | — | Extra class on `.vpdf-root` |
| `allowAttachmentDownload` | `true` | `false` emits `attachmentDownload` / `onAttachmentDownload` instead of saving immediately |

`documentInit.enableScripting` and `documentInit.isEvalSupported` are overwritten after merge. Scripting follows `features.scripting`; eval stays off. See [Security](/guide/security).

## Scale

Numeric scales are clamped to **25%–800%**. Fit presets map onto PDF.js:

- `page-fit` — entire page
- `page-width` — width
- `page-height` — height
- `page-actual` — 100%
- `auto` — PDF.js auto

`options.scale` and `controller.setScale()` accept all of those values. The zoom menu lists Fit page, Fit width, Fit height, plus 25%, 50%, 75%, 100%, 125%, 150%, 200%, 300%, 400%, and 800%. It does not list `page-actual` or `auto`.

## External links

```ts
externalLinks: {
  enabled: true,
  target: "_blank",
  rel: "noopener noreferrer nofollow",
}
```

Set `enabled: false` to stop opening external PDF links.

## Page spacing and corners

`pageGap`, `pageRadius`, and `destinationOffset` are specified at 100% scale and grow with zoom. CSS variables `--vpdf-page-gap` and `--vpdf-page-radius` are applied on the viewer root.

`smoothJump` animates prev/next, page-number, and keyboard jumps. `prefers-reduced-motion` stays instant. Single-page virtual scroll also skips smooth jumping.

## Annotation vs annotation layer

- `features.annotationLayer` — PDF.js form / annotation **display** layer
- `features.annotations` plus `toolbar.annotations` — highlight, free text, ink, and stamp **editors**
