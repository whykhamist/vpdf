# vpdf-plugin-print

> [@whykhamist/vpdf-plugin-print](/plugins/print)

## v3.0.1

> Released on October 29, 2026

### ✏️ Changed

- Updated the peer dependency version requirement in `package.json` from `3.0.0` to `^3.0.0` to allow compatible minor and patch versions.

## v3.0.0

> Released on October 7, 2026

### 🎉 First published version.

- Factory: `VPdfPrintPlugin` only (no `createPrintPlugin` alias).
- Plugin id: `vpdf.print`.
- Options: `dpi` (default `150`) and `title` (document title, then `"Document"`).
- Toolbar print button; progress via `registerControl` in `page-overlay-host`. Cancel and `ctx.signal` abort the job.
- Prints through a hidden iframe. Each page uses PDF.js `intent: "print"`; XFA pages use `XfaLayer`.
- Public helper: `printPdfDocument`.
