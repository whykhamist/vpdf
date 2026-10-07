# Iconify plugin types

Package: `@whykhamist/vpdf-plugin-iconify`. See [Iconify plugin](/plugins/iconify).

## VPdfIconifyPluginOptions

| Property | Type | Description |
| --- | --- | --- |
| `icons` | `VPdfIconifyIconMap` | Per-slot icon overrides |
| `fileIcons` | `boolean` | Map `file:<ext>` to vscode-icons; default `true` |
| `iconify` | `VPdfIconifyRuntimeOptions` | Extra Iconify collections and API |

## VPdfIconifyIconMap

```ts
type VPdfIconifyIconMap = Partial<
  Record<VPdfIconSlot | string, VPdfIconifyIconValue>
>;
```

[`VPdfIconSlot`](/guide/types#vpdficonslot) values are listed in the [Icons](/guide/icons) guide.

## VPdfIconifyIconValue

Iconify name string, bundled icon object, or inline SVG `{ body, width?, height? }`.

## VPdfIconifyRuntimeOptions

| Property | Type | Description |
| --- | --- | --- |
| `collections` | `IconifyJSON[]` | Local Iconify collections |
| `icons` | `Record<string, IconifyIcon>` | Individual icons |
| `iconProps` | `Partial<IconProps>` | Default Iconify component props |
| `api` | `false \| VPdfIconifyApiOptions` | Default `false` (offline); object enables remote API |

## VPdfIconifyApiOptions

| Property | Type | Description |
| --- | --- | --- |
| `providers` | `Record<string, PartialIconifyAPIConfig>` | API provider URLs |
| `setCustomIconLoader` | `{ prefix, provider?, loader }` | Single-icon loader |
| `setCustomIconsLoader` | `{ prefix, provider?, loader }` | Multi-icon loader |
