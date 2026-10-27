# @whykhamist/vpdf-plugin-iconify

[Iconify plugin](/plugins/iconify) changelog. Peer: `@whykhamist/vpdf@3.0.0`.

## 3.0.0

2026-10-07. First published version.

- Factory: `createIconifyPlugin` (`VPdfIconifyPlugin` alias).
- Plugin id: `vpdf.iconify`.
- Replaces viewer UI icons with Iconify SVGs. Lucide (toolbar slots) and vscode-icons file-type glyphs (attachments) are bundled locally.
- Default runtime is `@iconify/vue/offline`. No network to `api.iconify.design`.
- Package also exports `./style.css`.
