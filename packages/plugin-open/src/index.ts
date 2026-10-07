import { computed, markRaw } from "vue";
import type { VPdfPluginDefinition } from "@whykhamist/vpdf";
import OpenFileButton from "./OpenFileButton.vue";

const OpenFileButtonRaw = markRaw(OpenFileButton);

export const VPDF_OPEN_PLUGIN_ID = "vpdf.open";

export function VPdfOpenPlugin(): VPdfPluginDefinition {
  return {
    id: VPDF_OPEN_PLUGIN_ID,
    name: "Open",
    version: "3.0.0",
    setup(ctx) {
      return ctx.registerToolbarItem({
        id: "open",
        kind: "control",
        placement: "start",
        order: 0,
        component: OpenFileButtonRaw,
        props: computed(() => ({
          disabled: ctx.state.value.loadState === "loading",
          onOpen: (file: File) => ctx.controller.load(file),
        })),
      });
    },
  };
}

export { VPdfOpenPlugin as createOpenPlugin };
