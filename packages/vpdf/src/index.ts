import type { App } from "vue";
import VPdfViewer from "./components/VPdfViewer.vue";
import VPdfToolbar from "./components/VPdfToolbar.vue";
import VPdfSidebar from "./components/VPdfSidebar.vue";
import VPdfSearchBar from "./components/VPdfSearchBar.vue";
import VPdfPasswordDialog from "./components/VPdfPasswordDialog.vue";
import VPdfStatus from "./components/VPdfStatus.vue";
import VPdfIcon from "./components/VPdfIcon.vue";

import {
  VPdfButton,
  VPdfCard,
  VPdfCheckbox,
  VPdfDropdownMenu,
  VPdfInput,
  VPdfModal,
  VPdfSelect,
} from "./components/ui";

import { useVPdfViewer } from "./composables/useVPdfViewer";
import { VPDF_UI_DEFAULTS } from "./composables/uiDefaults";
import { VPDF_ICON_FALLBACKS, VPDF_ICON_SLOTS } from "./icons";
import { createPluginManager, PluginManager } from "./plugins/manager";

import {
  VpdfAnnotationsPlugin,
  createBuiltinPlugins,
  VPdfAttachmentsPlugin,
  VPdfDocumentPropertiesPlugin,
  VPdfDownloadPlugin,
  VPdfNavigationPlugin,
  VPdfOutlinePlugin,
  VPdfRotatePlugin,
  VPdfSearchPlugin,
  VPdfThumbnailsPlugin,
  VPdfZoomPlugin,
  VPDF_BUILTIN_PLUGIN_IDS,
} from "./plugins/builtins";

import {
  isFeatureEnabled,
  isToolbarFeatureEnabled,
  mergeViewerPlugins,
  resolvePluginFlag,
} from "./plugins/resolve";

import VPdfAnnotationEditor from "./components/VPdfAnnotationEditor.vue";
import { VPDF_UI_SLOTS } from "./types/ui";
import "./styles/index.css";
export type * from "./types";
export type * from "./plugins/types";
export type * from "./types/context";
export type * from "./types/ui";

export type {
  VPdfXfaThumbnailRasterizeParams,
  VPdfXfaThumbnailRasterizer,
} from "./utils/renderThumbnail";

export type { VPdfBuiltinPluginId } from "./plugins/builtins";

export type {
  VPdfIconRenderer,
  VPdfIconRendererProps,
  VPdfIconSlot,
} from "./icons";

export {
  VPdfViewer,
  VPdfToolbar,
  VPdfSidebar,
  VPdfSearchBar,
  VPdfPasswordDialog,
  VPdfModal,
  VPdfStatus,
  VPdfIcon,
  VPdfAnnotationEditor,
  VPdfButton,
  VPdfInput,
  VPdfSelect,
  VPdfCheckbox,
  VPdfDropdownMenu,
  VPdfCard,
  VPDF_UI_SLOTS,
  VPDF_UI_DEFAULTS,
  useVPdfViewer,
  VPDF_ICON_SLOTS,
  VPDF_ICON_FALLBACKS,
  createPluginManager,
  PluginManager,
  createBuiltinPlugins,
  VpdfAnnotationsPlugin,
  VPdfAttachmentsPlugin,
  VPdfDocumentPropertiesPlugin,
  VPdfDownloadPlugin,
  VPdfNavigationPlugin,
  VPdfOutlinePlugin,
  VPdfRotatePlugin,
  VPdfSearchPlugin,
  VPdfThumbnailsPlugin,
  VPdfZoomPlugin,
  VPDF_BUILTIN_PLUGIN_IDS,
  isFeatureEnabled,
  isToolbarFeatureEnabled,
  mergeViewerPlugins,
  resolvePluginFlag,
};

function install(app: App) {
  app.component("VPdfViewer", VPdfViewer);
}

const VPdf = { install };

export default VPdf;
