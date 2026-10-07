import { computed, markRaw, type Component } from "vue";
import type { VPdfAnnotationEditorMode, VPdfAnnotationEditorParams } from "../../types";
import type { VPdfPluginDefinition, VpdfAnnotationsPluginOptions } from "../types";
import { isFeatureEnabled, isToolbarFeatureEnabled } from "../resolve";
import { VPDF_ICON_SLOTS, type VPdfIconSlot } from "../../icons";
import { VPDF_BUILTIN_PLUGIN_IDS } from "./ids";
import VPdfAnnotationEditor from "../../components/VPdfAnnotationEditor.vue";
import VPdfAnnotationEditorHost from "../../components/VPdfAnnotationEditorHost.vue";
import VPdfAnnotationToolDropdown from "../../components/VPdfAnnotationToolDropdown.vue";

const DROPDOWN_EDITORS: Array<{
  id: string;
  mode: Exclude<VPdfAnnotationEditorMode, "none" | "stamp">;
  label: string;
  title: string;
  icon: VPdfIconSlot;
}> = [
  {
    id: "highlight",
    mode: "highlight",
    label: "Highlight",
    title: "Highlight",
    icon: VPDF_ICON_SLOTS.highlight,
  },
  {
    id: "freetext",
    mode: "freetext",
    label: "Free text",
    title: "Free text",
    icon: VPDF_ICON_SLOTS.freetext,
  },
  {
    id: "ink",
    mode: "ink",
    label: "Draw",
    title: "Draw",
    icon: VPDF_ICON_SLOTS.ink,
  },
];

const HostRaw = markRaw(VPdfAnnotationEditorHost);
const DefaultEditorRaw = markRaw(VPdfAnnotationEditor);
const DropdownRaw = markRaw(VPdfAnnotationToolDropdown);

export function VpdfAnnotationsPlugin(
  options?: VpdfAnnotationsPluginOptions,
): VPdfPluginDefinition<VpdfAnnotationsPluginOptions> {
  return {
    id: VPDF_BUILTIN_PLUGIN_IDS.annotations,
    name: "Annotations",
    options,
    setup(ctx, pluginOptions) {
      const visible = () =>
        isToolbarFeatureEnabled(ctx.options.value, "annotations") &&
        isFeatureEnabled(ctx.options.value, "annotations");

      const EditorRaw = markRaw(
        (pluginOptions?.editorComponent ?? DefaultEditorRaw) as Component,
      );

      const dropdownDisposers = DROPDOWN_EDITORS.map((editor, index) =>
        ctx.registerToolbarItem({
          id: editor.id,
          kind: "control",
          placement: "annotations",
          order: 20 + index,
          visible,
          component: DropdownRaw,
          props: computed(() => ({
            mode: editor.mode,
            label: editor.label,
            title: editor.title,
            icon: editor.icon,
            active: ctx.state.value.annotationEditorMode === editor.mode,
            params: ctx.state.value.annotationEditor.params,
            onToggle: () => {
              ctx.controller.setAnnotationEditorMode(
                ctx.state.value.annotationEditorMode === editor.mode
                  ? "none"
                  : editor.mode,
              );
            },
            onUpdate: (patch: VPdfAnnotationEditorParams) =>
              ctx.controller.updateAnnotationEditor(patch),
          })),
        }),
      );

      const disposeStamp = ctx.registerToolbarItem({
        id: "stamp",
        label: "Stamp",
        title: "Stamp",
        icon: VPDF_ICON_SLOTS.stamp,
        placement: "annotations",
        order: 23,
        visible,
        active: () => ctx.state.value.annotationEditorMode === "stamp",
        onClick: () => {
          ctx.controller.setAnnotationEditorMode(
            ctx.state.value.annotationEditorMode === "stamp" ? "none" : "stamp",
          );
        },
      });

      const disposeHost = ctx.registerControl({
        id: "annotation-editor",
        region: "page-overlay-host",
        order: 10,
        visible,
        component: HostRaw,
        props: computed(() => ({
          editorType: ctx.state.value.annotationEditor.editorType,
          params: ctx.state.value.annotationEditor.params,
          canDelete: ctx.state.value.annotationEditor.hasSelection,
          actions: {
            update: (patch: VPdfAnnotationEditorParams) =>
              ctx.controller.updateAnnotationEditor(patch),
            deleteSelected: () => ctx.controller.deleteSelectedAnnotation(),
          },
          container: ctx.viewerHost.value,
          editorComponent: EditorRaw,
        })),
      });

      return () => {
        disposeHost();
        disposeStamp();
        for (const dispose of dropdownDisposers) dispose();
      };
    },
  };
}
