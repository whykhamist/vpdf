# @whykhamist/vpdf-plugin-page-layout

[Page layout plugin](/plugins/page-layout) changelog. Peer: `@whykhamist/vpdf@3.0.0`.

## 3.0.0

2026-10-07. First published version.

- Factory: `createPageLayoutPlugin` (`VPdfPageLayoutPlugin` alias).
- Plugin id: `page-layout`.
- Toolbar `<select>` that maps onto PDF.js `scrollMode` / `spreadMode`. The control shows whenever the plugin is registered and enabled.
- Modes: `vertical`, `horizontal`, `two-column`, `wrapped`, `single-page`.
- Reapplies the last mode on `onReady` because PDF.js resets layout on load. Disabling the plugin restores `vertical`.
- Helpers: `PAGE_LAYOUT_OPTIONS`, `mapPageLayoutMode`, `applyPageLayout`.
