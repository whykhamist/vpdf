# vpdf-plugin-open

> [@whykhamist/vpdf-plugin-open](/plugins/open)

## v3.0.1

> Released on October 29, 2026

### ✏️ Changed

- Updated the peer dependency version requirement in `package.json` from `3.0.0` to `^3.0.0` to allow compatible minor and patch versions.

## v3.0.0

> Released on October 7, 2026

### 🎉 First published version.

- Factory: `createOpenPlugin` (`VPdfOpenPlugin` alias).
- Plugin id: `vpdf.open`.
- Toolbar control (`kind: "control"`, `placement: "start"`) that loads a local PDF with `controller.load(file)`.
- Accepts `application/pdf,.pdf`. Disabled while `loadState === "loading"`.
- No plugin options object.
