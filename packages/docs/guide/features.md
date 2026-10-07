# Features and toolbar

`features` ([`VPdfFeatureFlags`](/guide/types#vpdffeatureflags)) controls engine capabilities. `toolbar` ([`VPdfToolbarFeatures`](/guide/types#vpdftoolbarfeatures)) controls which built-in chrome is shown. Plugin activation is a third switch: [`VPdfPluginsConfig`](/plugins/types/#vpdfpluginsconfig) `enabled`.

## Feature defaults

```ts
{
  textLayer: true,
  annotationLayer: true,
  xfa: true,
  search: true,
  thumbnails: true,
  outline: true,
  attachments: true,
  annotations: true,
  scripting: false,
}
```

| Flag                                     | Effect                                                                                                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `textLayer`                              | PDF.js text layer (required for search highlighting)                                                             |
| `annotationLayer`                        | Form / annotation display (`AnnotationMode.ENABLE_FORMS`)                                                        |
| `xfa`                                    | `enableXfa`. Pure XFA with `xfa: false` becomes `unsupported` (`XFA_UNSUPPORTED`) after the document is attached |
| `search`                                 | Find engine. The find UI also needs `toolbar.search`                                                             |
| `thumbnails` / `outline` / `attachments` | Built-in sidebar panels (`vpdf.thumbnails`, `vpdf.outline`, `vpdf.attachments`)                                  |
| `annotations`                            | Native editors. The editor chrome also needs `toolbar.annotations`                                               |
| `scripting`                              | PDF JavaScript. **Off by default.**                                                                              |

## Toolbar defaults

```ts
{
  download: true,
  search: true,
  zoom: true,
  rotate: true,
  pageNav: true,
  sidebar: true,
  annotations: true,
  documentProperties: true,
}
```

`toolbar: false` hides the toolbar and makes every `isToolbarFeatureEnabled` check return false. Built-in zoom, paging, search, and similar shortcuts and gestures stay off because those plugins read that helper. User-plugin shortcuts still run unless their `when` checks the toolbar.

## Three ways to turn something off {#built-in-plugins-honor-both}

| Switch                                 | What it does                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `plugins.enabled['vpdf.zoom'] = false` | Deactivates the plugin. `setup` does not run. No UI, shortcuts, or gestures from that plugin.                 |
| `toolbar.zoom: false`                  | Plugin stays active. Built-ins hide their chrome and, where they check the flag, skip shortcuts and gestures. |
| `features.search: false`               | Turns off the engine capability. Search also requires `toolbar.search`.                                       |

Example: disable download entirely:

```ts
import { VPDF_BUILTIN_PLUGIN_IDS } from "@whykhamist/vpdf";

const plugins = {
  enabled: {
    [VPDF_BUILTIN_PLUGIN_IDS.download]: false,
  },
};
```

`isFeatureEnabled` and `isToolbarFeatureEnabled` are public if a user plugin needs the same gating.

See [Built-in plugins](/plugins/built-ins) for each plugin's flags.
