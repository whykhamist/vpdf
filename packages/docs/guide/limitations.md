# Limitations

vpdf is a viewer on PDF.js, not a full PDF editor or signing product.

## Supported in core

- URL / File / Blob / `ArrayBuffer` / `Uint8Array` sources
- Workers, lazy page rendering, cleanup on close
- Password prompt and retry
- Text layer and search
- Outline, thumbnails, attachments, internal destinations, external links
- XFA **display** when `features.xfa` is true
- Native editors: highlight, free text, ink, stamp
- Modified PDF export via PDF.js `saveDocument`
- Tailwind v4 theming under `.vpdf-root`
- Plugin hosts listed in [plugin overview](/plugins/overview)

## Not in core

- Arbitrary annotation JSON import/export
- Comment / popup authoring beyond PDF.js-native editors
- Cryptographic digital signatures / certificate trust
- XFA **editing**
- PDF JavaScript (opt-in `features.scripting` only)
- Open local file, print, page-layout dropdown, Iconify, html2canvas XFA thumbs — those are **separate packages**
- In-page PDF.js FileAttachment annotation downloads (sidebar attachments honor `allowAttachmentDownload`)

## Experimental

`controller.getExperimentalViewer()` returns the PDF.js `PDFViewer`. Page-layout uses it. The shape can change between minor versions.

## Version pin

Stay on `pdfjs-dist@6.3.289` with `@whykhamist/vpdf@3.0.0`. Extension packages are `3.0.0` and peer `@whykhamist/vpdf@3.0.0`.
