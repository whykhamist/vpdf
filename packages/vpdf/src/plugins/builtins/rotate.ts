import type { VPdfPluginDefinition } from "../types";
import { isToolbarFeatureEnabled } from "../resolve";
import { VPDF_ICON_SLOTS } from "../../icons";
import { VPDF_BUILTIN_PLUGIN_IDS } from "./ids";

export function VPdfRotatePlugin(): VPdfPluginDefinition {
  return {
    id: VPDF_BUILTIN_PLUGIN_IDS.rotate,
    name: "Rotate",
    setup(ctx) {
      return ctx.registerToolbarItem({
        id: "rotate",
        label: "Rotate",
        title: "Rotate clockwise",
        icon: VPDF_ICON_SLOTS.rotate,
        placement: "center",
        order: 20,
        visible: () => isToolbarFeatureEnabled(ctx.options.value, "rotate"),
        onClick: () => ctx.controller.rotate(90),
      });
    },
  };
}
