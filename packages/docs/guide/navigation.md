# Navigation and layout

Built-in plugin `vpdf.navigation` owns the sidebar toggle, page number control, previous/next buttons, and keyboard paging.

## Shortcuts

| Input | Action |
| --- | --- |
| Arrow Left / PageUp | Previous page |
| Arrow Right / PageDown | Next page |
| Home / End | First / last page |

Shortcuts are ignored while focus is in an input, select, textarea, or `contenteditable`.

`toolbar.pageNav: false` hides the page controls and skips those shortcuts. `plugins.enabled['vpdf.navigation'] = false` deactivates the plugin entirely (sidebar toggle included). See [Features and toolbar](/guide/features#built-in-plugins-honor-both).

## Page spacing and motion

`pageGap`, `pageRadius`, `destinationOffset`, and `smoothJump` are documented in [Options](/guide/options#page-spacing-and-corners).

## Page layout

Core does not ship a layout dropdown. Use [`@whykhamist/vpdf-plugin-page-layout`](/plugins/page-layout) to map vertical, horizontal, two-column, wrapped, and single-page modes onto PDF.js `scrollMode` / `spreadMode`.

Single-page layout uses a virtual scroller in core (`pageVirtualScroll`) so long documents keep a full-document scrollbar without keeping every page in the DOM.

## Rotate

`vpdf.rotate` adds a clockwise rotate control. `controller.rotate(-90)` is available for counterclockwise.
