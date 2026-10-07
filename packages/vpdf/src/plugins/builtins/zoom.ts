import { computed, markRaw, watch } from "vue";
import type { VPdfPluginDefinition } from "../types";
import { isToolbarFeatureEnabled } from "../resolve";
import { VPDF_BUILTIN_PLUGIN_IDS } from "./ids";
import ZoomControls from "./ZoomControls.vue";
import { bindZoomGestures } from "./zoomGestures";

const ZoomControlsRaw = markRaw(ZoomControls);

export function VPdfZoomPlugin(): VPdfPluginDefinition {
  return {
    id: VPDF_BUILTIN_PLUGIN_IDS.zoom,
    name: "Zoom",
    setup(ctx) {
      const zoomEnabled = () =>
        isToolbarFeatureEnabled(ctx.options.value, "zoom");
      let stopGestures: (() => void) | undefined;

      const stopWatch = watch(
        () => [ctx.viewerHost.value, zoomEnabled()] as const,
        ([host, enabled]) => {
          stopGestures?.();
          stopGestures = undefined;
          if (!host || !enabled) return;
          stopGestures = bindZoomGestures({
            host,
            getScale: () => ctx.state.value.scale,
            setScale: (scale) => ctx.controller.setScale(scale),
            enabled: zoomEnabled,
          });
        },
        { immediate: true },
      );

      const disposeToolbar = ctx.registerToolbarItem({
        id: "zoom",
        kind: "control",
        placement: "center",
        order: 10,
        visible: zoomEnabled,
        component: ZoomControlsRaw,
        props: computed(() => ({
          scale: ctx.state.value.scale,
          scalePreset: ctx.state.value.scalePreset,
          pageCount: ctx.state.value.pageCount,
          onZoomIn: () => ctx.controller.zoomIn(),
          onZoomOut: () => ctx.controller.zoomOut(),
          onSetScale: (scale: number | string) =>
            ctx.controller.setScale(scale),
        })),
      });

      const shortcutDisposers = [
        { id: "in-equal-ctrl", key: "=", ctrl: true },
        { id: "in-equal-meta", key: "=", meta: true },
        { id: "in-plus-ctrl", key: "+", ctrl: true },
        { id: "in-plus-meta", key: "+", meta: true },
        { id: "in-plus-shift-ctrl", key: "+", ctrl: true, shift: true },
        { id: "in-plus-shift-meta", key: "+", meta: true, shift: true },
        { id: "out-ctrl", key: "-", ctrl: true },
        { id: "out-meta", key: "-", meta: true },
        { id: "reset-ctrl", key: "0", ctrl: true },
        { id: "reset-meta", key: "0", meta: true },
      ].map((shortcut) =>
        ctx.registerShortcut({
          ...shortcut,
          when: zoomEnabled,
          handler: () => {
            if (shortcut.id.startsWith("in-")) ctx.controller.zoomIn();
            else if (shortcut.id.startsWith("out-")) ctx.controller.zoomOut();
            else ctx.controller.setScale(1);
          },
        }),
      );

      return () => {
        stopWatch();
        stopGestures?.();
        disposeToolbar();
        for (const dispose of shortcutDisposers) dispose();
      };
    },
  };
}
