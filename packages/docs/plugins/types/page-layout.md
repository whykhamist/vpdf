# Page layout plugin types

Package: `@whykhamist/vpdf-plugin-page-layout`. See [Page layout](/plugins/page-layout).

## VPdfPageLayoutPluginOptions

| Property | Type | Description |
| --- | --- | --- |
| `defaultMode` | `VPdfPageLayoutMode` | Initial layout mode; default `vertical` |

## VPdfPageLayoutMode

```ts
type VPdfPageLayoutMode =
  | "vertical"
  | "horizontal"
  | "two-column"
  | "wrapped"
  | "single-page";
```
