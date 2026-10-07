import { computed, defineComponent, h, ref } from "vue";
import {
  VPdfButton,
  VPdfCard,
  type VPdfPluginDefinition,
} from "@whykhamist/vpdf";

const DemoPanel = defineComponent({
  props: {
    marks: { type: Number, required: true },
  },
  setup(props) {
    return () =>
      h("p", { class: "m-0 text-sm" }, `Marks on this document: ${props.marks}`);
  },
});

const PageBadge = defineComponent({
  props: { pageNumber: { type: Number, required: true } },
  setup(props) {
    return () =>
      h(
        "span",
        {
          class:
            "pointer-events-none absolute top-2 right-2 rounded px-2 py-0.5 text-xs text-white",
          style: "background:#2563eb",
        },
        `Page ${props.pageNumber}`,
      );
  },
});

const MarksModal = defineComponent({
  props: { marks: { type: Number, required: true } },
  emits: { close: () => true },
  setup(props, { emit }) {
    return () =>
      h(VPdfCard, { title: "Demo marks" }, {
        default: () =>
          h("p", { class: "m-0 text-sm" }, `You have marked ${props.marks} time(s).`),
        footer: () =>
          h(
            VPdfButton,
            { variant: "solid", onClick: () => emit("close") },
            () => "Close",
          ),
      });
  },
});

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

      const disposeToolbar = ctx.registerToolbarItem({
        id: "mark",
        label: "Mark",
        placement: "overflow",
        title: "Add a demo mark",
        onClick: bump,
      });

      const disposeMenu = ctx.registerMenuItem({
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

      const disposeReset = ctx.registerMenuItem({
        id: "reset",
        label: "Reset demo marks",
        disabled: () => marks.value === 0,
        onClick: () => {
          marks.value = 0;
          ctx.setPluginState({ marks: 0 });
          ctx.closeModal();
        },
      });

      const disposePanel = ctx.registerPanel({
        id: "demo",
        label: "Demo",
        component: DemoPanel,
        order: 100,
        props: computed(() => ({ marks: marks.value })),
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
        console.info("ready", ctx.state.value.pageCount, options?.markColor);
      });

      return () => {
        disposeToolbar();
        disposeMenu();
        disposeReset();
        disposePanel();
        disposeOverlay();
        disposeShortcut();
        disposeReady();
      };
    },
  };
}
