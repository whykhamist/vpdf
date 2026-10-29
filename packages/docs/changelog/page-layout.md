# vpdf-plugin-page-layout

> [@whykhamist/vpdf-plugin-page-layout](/plugins/page-layout)

## v3.0.1

> Released on October 29, 2026

### ✏️ Changed

- Updated the peer dependency version requirement in `package.json` from `3.0.0` to `^3.0.0` to allow compatible minor and patch versions.

## v3.0.0

> Released on October 7, 2026

### 🎉 First published version.

- Factory: `createPageLayoutPlugin` (`VPdfPageLayoutPlugin` alias).
- Plugin id: `page-layout`.
- Toolbar `<select>` that maps onto PDF.js `scrollMode` / `spreadMode`. The control shows whenever the plugin is registered and enabled.
- Modes: `vertical`, `horizontal`, `two-column`, `wrapped`, `single-page`.
- Reapplies the last mode on `onReady` because PDF.js resets layout on load. Disabling the plugin restores `vertical`.
- Helpers: `PAGE_LAYOUT_OPTIONS`, `mapPageLayoutMode`, `applyPageLayout`.
