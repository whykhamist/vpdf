import type {
  VPdfPluginDefinition,
  VPdfXfaThumbnailRasterizeParams,
} from "@whykhamist/vpdf";
import {
  loadHtml2Canvas,
  rasterizeXfaThumbnail,
  type Html2CanvasFn,
} from "./rasterizeThumbnail";

export const VPDF_XFA_THUMBNAIL_RASTER_PLUGIN_ID = "vpdf.xfa-thumbnail-raster";

export interface VPdfXfaThumbnailRasterPluginOptions {
  /** @internal Test hook for html2canvas import. */
  html2canvas?: Html2CanvasFn;
}

export { loadHtml2Canvas, rasterizeXfaThumbnail, type Html2CanvasFn };

export function VPdfXfaThumbnailRasterPlugin(
  pluginOptions: VPdfXfaThumbnailRasterPluginOptions = {},
): VPdfPluginDefinition<VPdfXfaThumbnailRasterPluginOptions> {
  return {
    id: VPDF_XFA_THUMBNAIL_RASTER_PLUGIN_ID,
    name: "XFA thumbnail raster",
    version: "3.0.0",
    options: pluginOptions,
    setup(ctx) {
      const rasterize = async (params: VPdfXfaThumbnailRasterizeParams) => {
        const html2canvas =
          pluginOptions.html2canvas ?? (await loadHtml2Canvas());
        await rasterizeXfaThumbnail(params, html2canvas);
      };
      return ctx.registerXfaThumbnailRasterizer(rasterize);
    },
  };
}

export { VPdfXfaThumbnailRasterPlugin as createXfaThumbnailRasterPlugin };
