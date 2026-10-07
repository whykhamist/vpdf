import type { VPdfPluginDefinition } from "../types";
import { VpdfAnnotationsPlugin } from "./annotations";
import { VPdfAttachmentsPlugin } from "./attachments";
import { VPdfDocumentPropertiesPlugin } from "./documentProperties";
import { VPdfDownloadPlugin } from "./download";
import { VPdfNavigationPlugin } from "./navigation";
import { VPdfOutlinePlugin } from "./outline";
import { VPdfRotatePlugin } from "./rotate";
import { VPdfSearchPlugin } from "./search";
import { VPdfThumbnailsPlugin } from "./thumbnails";
import { VPdfZoomPlugin } from "./zoom";

export { VPDF_BUILTIN_PLUGIN_IDS } from "./ids";
export type { VPdfBuiltinPluginId } from "./ids";

export function createBuiltinPlugins(): VPdfPluginDefinition[] {
  return [
    VPdfNavigationPlugin(),
    VPdfZoomPlugin(),
    VPdfRotatePlugin(),
    VPdfSearchPlugin(),
    VpdfAnnotationsPlugin(),
    VPdfDownloadPlugin(),
    VPdfThumbnailsPlugin(),
    VPdfOutlinePlugin(),
    VPdfAttachmentsPlugin(),
    VPdfDocumentPropertiesPlugin(),
  ];
}

export {
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
  VPdfDocumentPropertiesPlugin as createDocumentPropertiesPlugin,
  VPdfNavigationPlugin as createNavigationPlugin,
  VPdfZoomPlugin as createZoomPlugin,
};
