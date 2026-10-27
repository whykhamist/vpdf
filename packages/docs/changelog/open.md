# @whykhamist/vpdf-plugin-open

[Open plugin](/plugins/open) changelog. Peer: `@whykhamist/vpdf@3.0.0`.

## 3.0.0

2026-10-07. First published version.

- Factory: `createOpenPlugin` (`VPdfOpenPlugin` alias).
- Plugin id: `vpdf.open`.
- Toolbar control (`kind: "control"`, `placement: "start"`) that loads a local PDF with `controller.load(file)`.
- Accepts `application/pdf,.pdf`. Disabled while `loadState === "loading"`.
- No plugin options object.
