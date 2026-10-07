import { computed, markRaw } from "vue";
import type { VPdfOutlineItem } from "../../types";
import type { VPdfPluginDefinition } from "../types";
import { isFeatureEnabled } from "../resolve";
import { VPDF_BUILTIN_PLUGIN_IDS } from "./ids";
import { VPDF_ICON_SLOTS } from "../../icons";
import OutlinePanel from "./OutlinePanel.vue";

const OutlinePanelRaw = markRaw(OutlinePanel);

export function VPdfOutlinePlugin(): VPdfPluginDefinition {
  return {
    id: VPDF_BUILTIN_PLUGIN_IDS.outline,
    name: "Outline",
    setup(ctx) {
      return ctx.registerPanel({
        id: "outline",
        label: "Outline",
        icon: VPDF_ICON_SLOTS.outline,
        order: 20,
        visible: () => isFeatureEnabled(ctx.options.value, "outline"),
        component: OutlinePanelRaw,
        props: computed(() => ({
          items: ctx.state.value.outline,
          onSelect: async (item: VPdfOutlineItem) => {
            if (item.dest) {
              await ctx.controller.goToDestination(item.dest);
              return;
            }
            if (item.url) {
              window.open(item.url, "_blank", "noopener,noreferrer");
            }
          },
        })),
      });
    },
  };
}
