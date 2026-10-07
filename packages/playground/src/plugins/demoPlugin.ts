import { defineComponent, h, ref } from "vue";
import type { VPdfPluginDefinition } from "@whykhamist/vpdf";

const DemoPanel = defineComponent({
  name: "DemoPluginPanel",
  setup() {
    return () =>
      h("div", { class: "demo-plugin-panel" }, [
        h("p", { class: "m-0 mb-2 font-semibold" }, "Sample plugin"),
        h(
          "p",
          { class: "m-0 text-sm text-slate-500" },
          "Registers toolbar, panel, shortcut (Alt+M), overflow menu, and a page overlay.",
        ),
      ]);
  },
});

const ExtraPanel = defineComponent({
  name: "DemoExtraPanel",
  setup() {
    return () =>
      h(
        "p",
        { class: "m-0 text-sm text-slate-500" },
        "Second sidebar panel to exercise tab selection.",
      );
  },
});

const PageBadge = defineComponent({
  name: "DemoPageBadge",
  props: {
    pageNumber: { type: Number, required: true },
  },
  setup(props) {
    return () =>
      h(
        "span",
        {
          class:
            "pointer-events-none absolute top-2 right-2 rounded bg-blue-600 px-2 py-0.5 text-xs text-white",
        },
        `Page ${props.pageNumber}`,
      );
  },
});

export function VPdfDemoPlugin(): VPdfPluginDefinition<
  { markColor: string },
  { marks: number }
> {
  return {
    id: "demo-marks",
    name: "Demo Marks",
    version: "0.1.0",
    options: { markColor: "#2563eb" },
    createState: () => ({ marks: 0 }),
    setup(ctx, options) {
      const marks = ref(ctx.getPluginState<{ marks: number }>()?.marks ?? 0);

      const bump = () => {
        marks.value += 1;
        ctx.setPluginState({ marks: marks.value });
      };

      const disposeToolbar = ctx.registerToolbarItem({
        id: "mark",
        label: `Mark (${marks.value})`,
        title: "Increment demo mark counter",
        placement: "overflow",
        onClick: bump,
      });

      const disposeMenu = ctx.registerMenuItem({
        id: "reset",
        label: "Reset demo marks",
        onClick: () => {
          marks.value = 0;
          ctx.setPluginState({ marks: 0 });
        },
      });

      const disposePanel = ctx.registerPanel({
        id: "demo",
        label: "Demo",
        component: DemoPanel,
        order: 100,
      });

      const disposeExtra = ctx.registerPanel({
        id: "demo-extra",
        label: "Extra",
        component: ExtraPanel,
        order: 110,
      });

      const disposeOverlay = ctx.registerPageOverlay({
        id: "badge",
        component: PageBadge,
      });

      const disposeShortcut = ctx.registerShortcut({
        id: "mark-shortcut",
        key: "m",
        alt: true,
        handler: bump,
      });

      const disposeReady = ctx.on("onReady", () => {
        console.info("[demo-plugin] document ready", {
          pages: ctx.state.value.pageCount,
          color: options?.markColor,
        });
      });

      return () => {
        disposeToolbar();
        disposeMenu();
        disposePanel();
        disposeExtra();
        disposeOverlay();
        disposeShortcut();
        disposeReady();
      };
    },
  };
}
