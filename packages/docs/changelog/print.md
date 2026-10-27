# @whykhamist/vpdf-plugin-print

[Print plugin](/plugins/print) changelog. Peer: `@whykhamist/vpdf@3.0.0`.

## 3.0.0

2026-10-07. First published version.

- Factory: `VPdfPrintPlugin` only (no `createPrintPlugin` alias).
- Plugin id: `vpdf.print`.
- Options: `dpi` (default `150`) and `title` (document title, then `"Document"`).
- Toolbar print button; progress via `registerControl` in `page-overlay-host`. Cancel and `ctx.signal` abort the job.
- Prints through a hidden iframe. Each page uses PDF.js `intent: "print"`; XFA pages use `XfaLayer`.
- Public helper: `printPdfDocument`.
