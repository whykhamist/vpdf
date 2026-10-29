# vpdf-plugin-iconify

> [@whykhamist/vpdf-plugin-iconify](/plugins/iconify)

## v3.0.1

> Released on October 29, 2026

### ✏️ Changed

- Updated the peer dependency version requirement in `package.json` from `3.0.0` to `^3.0.0` to allow compatible minor and patch versions.

## v3.0.0

> Released on October 7, 2026

### 🎉 First published version.

- Factory: `createIconifyPlugin` (`VPdfIconifyPlugin` alias).
- Plugin id: `vpdf.iconify`.
- Replaces viewer UI icons with Iconify SVGs. Lucide (toolbar slots) and vscode-icons file-type glyphs (attachments) are bundled locally.
- Default runtime is `@iconify/vue/offline`. No network to `api.iconify.design`.
- Package also exports `./style.css`.
