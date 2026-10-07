# Security

vpdf keeps PDF.js capabilities that have a high cost **off** unless you opt in.

## Scripting

`features.scripting` defaults to **false**. That maps to PDF.js `enableScripting`. Leave it off unless you trust the document source. PDF.js has published scripting-related advisories (including CVE-2026-16633).

The engine also sets `isEvalSupported: false`. Host `documentInit` values for those two flags are overwritten after merge. See [Sources](/guide/sources#authentication-and-custom-headers).

## External links

External PDF links open in a new tab with `noopener noreferrer nofollow` by default. Disable or customize them with [`options.externalLinks`](/guide/options#external-links). Download anchors use `rel="noopener"`.

## Attachments

Embedded files in the Files sidebar download on click when `allowAttachmentDownload` is true (the default). Set it to `false` and handle `@attachment-download` (or `plugins.on('onAttachmentDownload')`) if the host must confirm first. Treat attachments as untrusted binaries. In-page FileAttachment annotations are not gated by this flag. See [Sidebar](/guide/sidebar#attachments).

## Document properties

The properties modal is an allowlist. It omits URLs, fingerprints, encryption details, permissions, scripts, raw XMP, and custom Info keys.

## Print

The print plugin copies parent stylesheets into a hidden iframe and renders with `intent: 'print'` plus annotation storage. It does not execute PDF JavaScript.

## Host duties

- Serve worker and font files from a trusted origin
- Do not enable scripting for arbitrary user uploads
- Persist annotations through your own authenticated API, not `localStorage` of PDF bytes unless that matches your threat model
