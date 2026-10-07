# useVPdfViewer

Headless API for a custom shell. `VPdfViewer` is a wrapper around this composable. Parameter and return shapes are listed under [useVPdfViewer](/guide/types#usevpdfviewer-parameters-and-return); options use [`VPdfViewerOptions`](/guide/types#vpdfvieweroptions).

```ts
import { ref } from "vue";
import { useVPdfViewer, type VPdfViewerOptions } from "@whykhamist/vpdf";

const options = ref<VPdfViewerOptions>({
  src: "/sample.pdf",
  toolbar: false,
});

const api = useVPdfViewer({
  options,
  plugins: { plugins: [] },
});

onMounted(() => {
  api.mount(container.value);
});

onBeforeUnmount(() => {
  api.destroy();
});
```

`plugins: { plugins: [] }` still merges all built-ins. An empty array means no extra user plugins. Disable built-ins with `plugins.enabled`:

```ts
const api = useVPdfViewer({
  options,
  plugins: {
    plugins: [],
    enabled: { "vpdf.download": false },
  },
});
```

## Returns

| Field | Role |
| --- | --- |
| `state` | Readonly viewer state |
| `mutableState` | Internal writable ref (prefer controller) |
| `options` | The options ref you passed |
| `controller` | Same [`VPdfViewerController`](/guide/types#vpdfviewercontroller) as `VPdfViewer` |
| `plugins` | `PluginManager` |
| `containerRef` | Optional bind target |
| `resolvedToolbar` / `resolvedFeatures` | Merged defaults |
| `mount(el)` | Attach PDF.js to a DOM element |
| `destroy()` | Tear down plugins, then the engine |
| `ensureMounted()` | Used internally by `load` |

`options.src` is watched; changing it calls `controller.load`.

`api.plugins` is the [PluginManager](/plugins/advanced). Headless hosts must mount a container, optionally listen for shortcuts, and render plugin views themselves.

Mount only in the browser. See [SSR](/guide/ssr).

Injection keys `VPDF_VIEWER_KEY`, `VPDF_CONTROLLER_KEY`, and `VPDF_STATE_KEY` exist in source for the default shell. They are type-only re-exports from the package entry, not runtime values. Do not `inject` them from application code. `VPdfViewer` sets `pluginContext` to `undefined` on the injected viewer object.
