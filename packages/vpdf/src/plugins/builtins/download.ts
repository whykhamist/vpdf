import type { VPdfPluginDefinition } from "../types";
import { isToolbarFeatureEnabled } from "../resolve";
import { VPDF_ICON_SLOTS } from "../../icons";
import { VPDF_BUILTIN_PLUGIN_IDS } from "./ids";

export function VPdfDownloadPlugin(): VPdfPluginDefinition {
  return {
    id: VPDF_BUILTIN_PLUGIN_IDS.download,
    name: "Download",
    setup(ctx) {
      return ctx.registerToolbarItem({
        id: "download",
        label: "Download",
        title: () =>
          ctx.state.value.hasModifications ? "Save modified PDF" : "Download",
        icon: () =>
          ctx.state.value.hasModifications
            ? VPDF_ICON_SLOTS.save
            : VPDF_ICON_SLOTS.download,
        placement: "end",
        order: 80,
        visible: () => isToolbarFeatureEnabled(ctx.options.value, "download"),
        disabled: () => ctx.state.value.loadState !== "ready",
        onClick: async () => {
          if (ctx.state.value.hasModifications) {
            await ctx.controller.saveModified();
          } else {
            await ctx.controller.downloadOriginal();
          }
        },
      });
    },
  };
}
