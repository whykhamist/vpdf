# Changelog

Current line: **3.0.0** (2026-10-07). First stable release for the core viewer and every opt-in plugin package.

Putting a plugin package in `node_modules` does nothing until its factory is in `plugins.plugins`.

| Package | Notes |
| --- | --- |
| [`@whykhamist/vpdf`](/changelog/vpdf) | Viewer core, plugin hosts, and built-in controls |
| [`@whykhamist/vpdf-plugin-open`](/changelog/open) | Toolbar control that loads a local PDF |
| [`@whykhamist/vpdf-plugin-print`](/changelog/print) | Print current document through a hidden iframe |
| [`@whykhamist/vpdf-plugin-page-layout`](/changelog/page-layout) | Scroll and spread mode dropdown |
| [`@whykhamist/vpdf-plugin-iconify`](/changelog/iconify) | Offline Iconify renderer for viewer icons |
| [`@whykhamist/vpdf-plugin-xfa-thumbnail-raster`](/changelog/xfa-thumbnail-raster) | html2canvas rasterizer for XFA thumbnails |

GitHub [releases](https://github.com/whykhamist/vpdf/releases) are tagged snapshots of the same versions. This site is the change history.
