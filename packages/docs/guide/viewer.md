# VPdfViewer

`VPdfViewer` is the default UI shell. It comes out of the box with a toolbar, sidebar, search bar, password dialog, plugin modal, status overlays, and the underlying PDF.js canvas.

> [!NOTE] Plugin Initialization
> The `:plugins` prop is read strictly when the component/composable is created. Changing that object later will not dynamically register or unregister plugins. For runtime toggles, use `api.plugins.setEnabled(id, boolean)` instead. See the [Plugin lifecycle](/plugins/lifecycle) guide for details.

## Props

### :src ([`VPdfSource`](/guide/types#vpdfsource))

The source of the PDF document. Can be a `URL string`, `URL`, `File`, `Blob`, `ArrayBuffer`, or `Uint8Array`. This property takes precedence over `options.src`.

### :options (`VPdfViewerOptions`)

Configuration options for the viewer. These are automatically merged with any source configuration.

### :plugins (`VPdfPluginsConfig`)

Configuration object structured as `{ plugins, enabled }`. Note that this is only read during component initialization.

### :ui (`Partial<VPdfUiComponents>`)

Allows you to override or replace default viewer primitives. This takes precedence over plugin `registerUiComponent` calls.

> [!TIP] Class Fallthrough
> Class attributes applied to the component will automatically fall through to the root `.vpdf-root` element. Alternatively, you can use `options.class` to achieve the same result.

## Events

### @ready

Emitted when the engine's loadState transitions to 'ready'. (No payload)

### @error

Emitted when `state.error` is triggered.

> Payload: `{ code, message }`

### @pageChange

Emitted whenever the active page number or total page count changes.

> Payload: `{ pageNumber, pageCount }`

### @attachmentDownload

Emitted when an attachment file in the sidebar is clicked while `allowAttachmentDownload` is set to `false`.

> Payload: `{ attachment, download }`

Headless hosts can also subscribe on the same bus with `api.plugins.on('onAttachmentDownload', handler)` instead of `@attachment-download`.

### Annotation and password (plugin event bus)

These are **not** Vue `@` events on `VPdfViewer`. The engine forwards them through `useVPdfViewer` into the shared [`PluginManager`](/plugins/advanced) event bus as `onAnnotationChange` and `onPassword` (keys from [`VPdfPluginEvents`](/plugins/types/#vpdfpluginevents), including the `on` prefix).

Only `onAttachmentDownload` is bridged to `@attachment-download`. Annotation and password notifications stay on the bus.

`PluginManager.on` returns a disposer — call it on unmount (same pattern as `stopAttachmentDownload` inside `VPdfViewer`).

- **`onPassword`** — [`VPdfPasswordRequest`](/guide/types#vpdfpasswordrequest) (`reason`, `submit`, `cancel`). The built-in shell shows a password modal via `state.password`; use the bus for logging, side effects, or a custom headless UI. See [Password and loading](/guide/loading).
- **`onAnnotationChange`** — [`VPdfAnnotationChangeEvent`](/guide/types#vpdfannotationchangeevent). See [Annotations](/guide/annotations) for persistence and `saveModified`.

Full event list: [Plugin events](/plugins/events).

**`<VPdfViewer ref="viewer">`**

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { VPdfViewer, type PluginManager } from "@whykhamist/vpdf";

const viewer = ref<{ plugins: PluginManager }>();
const disposers: Array<() => void> = [];

onMounted(() => {
  const plugins = viewer.value?.plugins;
  if (!plugins) return;
  disposers.push(
    plugins.on("onAnnotationChange", (event) => {
      /* persist or track edits */
    }),
    plugins.on("onPassword", (request) => {
      /* optional side effect; default modal still uses state.password */
    }),
  );
});

onBeforeUnmount(() => {
  for (const dispose of disposers) dispose();
});
</script>

<template>
  <VPdfViewer ref="viewer" :src="src" />
</template>
```

**Headless `useVPdfViewer()`**

```ts
import { useVPdfViewer } from "@whykhamist/vpdf";

const api = useVPdfViewer({ options, plugins });

const stopAnnotation = api.plugins.on("onAnnotationChange", (event) => {
  /* … */
});
const stopPassword = api.plugins.on("onPassword", (request) => {
  /* … */
});
const stopAttachment = api.plugins.on("onAttachmentDownload", (payload) => {
  /* … */
});

// await api.mount(host); … on teardown: stopAnnotation(); stopPassword(); stopAttachment();
```

**Custom plugin** (`ctx.on` uses the same bus as `plugins.on`)

```ts
import type { VPdfPluginDefinition } from "@whykhamist/vpdf";

export const myPlugin: VPdfPluginDefinition = {
  id: "my-plugin",
  setup(ctx) {
    ctx.on("onAnnotationChange", (event) => {
      /* … */
    });
    ctx.on("onPassword", (request) => {
      /* … */
    });
  },
};
```

## Template ref

The component exposes a template ref containing the [`controller`](/guide/types#vpdfviewercontroller), `state`, and `plugins` instances:

```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  VPdfViewer,
  type VPdfViewerController,
  type VPdfViewerState,
  type PluginManager,
} from "@whykhamist/vpdf";

const viewer = ref<{
  controller: VPdfViewerController;
  state: VPdfViewerState;
  plugins: PluginManager;
}>();

async function openFile(file: File) {
  await viewer.value?.controller.load(file);
}
</script>

<template>
  <VPdfViewer ref="viewer" :src="src" :options="options" :plugins="plugins" />
</template>
```

## Text Layer Class

When text layer rendering is disabled (i.e., when [`features.textLayer`](/guide/features) is set to `false`), the root container automatically appends the utility class `vpdf-no-text-layer`.
