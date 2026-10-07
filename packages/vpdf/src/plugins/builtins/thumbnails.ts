import { computed, markRaw } from "vue";
import type { VPdfPluginDefinition } from "../types";
import { isFeatureEnabled } from "../resolve";
import { VPDF_BUILTIN_PLUGIN_IDS } from "./ids";
import { VPDF_ICON_SLOTS } from "../../icons";
import ThumbnailsPanel from "./ThumbnailsPanel.vue";

const ThumbnailsPanelRaw = markRaw(ThumbnailsPanel);

export function VPdfThumbnailsPlugin(): VPdfPluginDefinition {
  return {
    id: VPDF_BUILTIN_PLUGIN_IDS.thumbnails,
    name: "Thumbnails",
    setup(ctx) {
      return ctx.registerPanel({
        id: "thumbnails",
        label: "Pages",
        icon: VPDF_ICON_SLOTS.thumbnails,
        order: 10,
        visible: () => isFeatureEnabled(ctx.options.value, "thumbnails"),
        component: ThumbnailsPanelRaw,
        props: computed(() => ({
          pageCount: ctx.state.value.pageCount,
          pageNumber: ctx.state.value.pageNumber,
          rotation: ctx.state.value.rotation,
          ready: ctx.state.value.loadState === "ready",
          documentKey: ctx.state.value.meta?.fingerprint ?? "",
          getPage: ctx.getPage,
          onGoToPage: (page: number) => ctx.controller.goToPage(page),
          columns: ctx.options.value.thumbnailColumns,
          rasterizeXfa: ctx.xfaThumbnailRasterizer.value,
        })),
      });
    },
  };
}
