# Icons

Core renders SVG fallbacks from PDF.js-style glyphs. Plugins can replace the renderer.

## Slots

[`VPdfIconSlot`](/guide/types#vpdficonslot) values (`VPDF_ICON_SLOTS`):

`sidebar`, `previousPage`, `nextPage`, `zoomIn`, `zoomOut`, `rotate`, `search`, `searchPrevious`, `searchNext`, `searchClose`, `searchMore`, `highlight`, `freetext`, `ink`, `stamp`, `download`, `save`, `more`, `thumbnails`, `outline`, `attachments`, `open`, `print`, `outlineExpand`, `outlineCollapse`, `editorDelete`, `properties`.

`VPDF_ICON_FALLBACKS` maps each slot to an inline SVG string.

`VPdfIcon` accepts `name` (slot) and optional `fallback`.

## Custom renderer

```ts
ctx.registerIconRenderer(MyIcon);
```

Last registered renderer wins for that viewer. The renderer is a [`VPdfIconRenderer`](/plugins/types/#vpdficonrenderer) with [`VPdfIconRendererProps`](/plugins/types/#vpdficonrendererprops) (`name`, optional `fallback`). When the renderer returns nothing, `VPdfIcon` still paints the `fallback` SVG (usually `VPDF_ICON_FALLBACKS`).

Use [`@whykhamist/vpdf-plugin-iconify`](/plugins/iconify) for Lucide toolbar icons and vscode-icons file glyphs. File attachments use `file:<ext>` (or `file:generic`) when that plugin is enabled.

Disabling the Iconify plugin restores the built-in fallbacks for that viewer instance.
