# Document properties

Built-in `vpdf.documentProperties` adds an overflow menu item that opens a modal.

Disable with `toolbar.documentProperties: false` or `plugins.enabled['vpdf.documentProperties'] = false`.

## Allowlist

The modal reads a **safe subset** of PDF.js metadata when opened:

- title, author, subject, keywords
- created, modified
- application (creator), producer
- PDF version
- file size
- first-page size (inches)
- tagged PDF
- page count
- Fast Web View

Missing values render as an em dash. File size prefers `Content-Length` / load progress and only calls `getDownloadInfo()` if those are unknown.

It does **not** show source URLs, fingerprints, encryption details, permissions, scripts, raw XMP, or custom Info keys.

Dates use `options.locale` when set.
