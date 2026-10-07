# Custom plugin

A compact plugin that stores a mark count, exposes it in the toolbar overflow, overflow menu, sidebar, and a modal, paints a page badge, and binds Alt+M.

<CustomPluginDemo />

Use **More actions** for **Mark** and **Show demo marks**. Open the sidebar for the **Demo** panel. Alt+M increments the count while the viewer is focused (not while typing in an input).

The live demo is `DemoMarksPlugin` in the docs theme (`packages/docs/.vitepress/theme/examples/demoMarksPlugin.ts`). Trimmed definition:

```ts
import { computed, ref } from "vue";
import type { VPdfPluginDefinition } from "@whykhamist/vpdf";

export function DemoMarksPlugin(): VPdfPluginDefinition<
  { markColor: string },
  { marks: number }
> {
  return {
    id: "demo-marks",
    name: "Demo Marks",
    options: { markColor: "#2563eb" },
    createState: () => ({ marks: 0 }),
    setup(ctx, options) {
      const marks = ref(ctx.getPluginState<{ marks: number }>()?.marks ?? 0);

      const bump = () => {
        marks.value += 1;
        ctx.setPluginState({ marks: marks.value });
      };

      ctx.registerToolbarItem({
        id: "mark",
        label: "Mark",
        placement: "overflow",
        title: "Add a demo mark",
        onClick: bump,
      });

      ctx.registerMenuItem({
        id: "about",
        label: "Show demo marks",
        onClick: () => {
          ctx.openModal({
            component: MarksModal,
            props: computed(() => ({ marks: marks.value })),
            dismissible: true,
          });
        },
      });

      ctx.registerMenuItem({
        id: "reset",
        label: "Reset demo marks",
        disabled: () => marks.value === 0,
        onClick: () => {
          marks.value = 0;
          ctx.setPluginState({ marks: 0 });
          ctx.closeModal();
        },
      });

      ctx.registerPanel({
        id: "demo",
        label: "Demo",
        component: DemoPanel,
        order: 100,
        props: computed(() => ({ marks: marks.value })),
      });

      ctx.registerPageOverlay({
        id: "badge",
        component: PageBadge,
      });

      ctx.registerShortcut({
        id: "mark-shortcut",
        key: "m",
        alt: true,
        handler: bump,
      });

      ctx.on("onReady", () => {
        console.info("ready", ctx.state.value.pageCount, options?.markColor);
      });
    },
  };
}
```

```vue
<VPdfViewer :src="src" :plugins="{ plugins: [DemoMarksPlugin()] }" />
```

`MarksModal`, `DemoPanel`, and `PageBadge` are Vue components in the live source. `MarksModal` renders `VPdfCard` — `openModal` has no `title` of its own.

`register*` and `ctx.on` are tracked automatically, so this `setup` can omit a return disposer. The live source still returns one so disable/destroy order is obvious.

| Surface | API |
| --- | --- |
| Overflow **Mark** | `registerToolbarItem` (`placement: "overflow"`) |
| **Show demo marks** / **Reset** | `registerMenuItem` + `openModal` / `closeModal` |
| **Demo** sidebar tab | `registerPanel` + `props` |
| Page corner badge | `registerPageOverlay` (no `pageNumbers` → every page) |
| Alt+M | `registerShortcut` |
| Count across disable | `createState` + `setPluginState` |

See [Writing a plugin](/plugins/writing) and [Plugin context](/plugins/context) for the rest of the API.
