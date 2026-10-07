# Full plugin stack

This example registers every optional plugin. Start with the [quick start](/guide/quick-start), then add only the packages the host needs.

<AllPluginsDemo />

```ts
import { VPdfOpenPlugin } from "@whykhamist/vpdf-plugin-open";
import { VPdfPrintPlugin } from "@whykhamist/vpdf-plugin-print";
import { VPdfPageLayoutPlugin } from "@whykhamist/vpdf-plugin-page-layout";
import { VPdfIconifyPlugin } from "@whykhamist/vpdf-plugin-iconify";
import { VPdfXfaThumbnailRasterPlugin } from "@whykhamist/vpdf-plugin-xfa-thumbnail-raster";
import "@whykhamist/vpdf-plugin-iconify/style.css";

const options = {
  pageGap: 10,
  pageRadius: 10,
  destinationOffset: 20,
  scale: "page-fit" as const,
};

const plugins = {
  plugins: [
    VPdfPageLayoutPlugin(),
    VPdfPrintPlugin({ dpi: 150 }),
    VPdfOpenPlugin(),
    VPdfIconifyPlugin(),
    VPdfXfaThumbnailRasterPlugin(),
  ],
};
```

```vue
<VPdfViewer :src="src" :options="options" :plugins="plugins" />
```

Import `@whykhamist/vpdf-plugin-iconify/style.css` when you register Iconify.

Registering a plugin enables it by default. The live demo sets a few `plugins.enabled` keys to `true` explicitly; that is redundant unless you also disable others. Use `plugins.enabled[id] = false` to hide a registered plugin without removing it.
