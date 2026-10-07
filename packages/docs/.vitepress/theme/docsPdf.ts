import type { VPdfAssetUrls, VPdfViewerOptions } from "@whykhamist/vpdf";
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

export const DEMO_PDF_URL =
  "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";

const pdfjsDist = new URL(
  "../../../../node_modules/pdfjs-dist/",
  import.meta.url,
);

export const docsPdfAssets: VPdfAssetUrls = {
  workerSrc,
  cMapUrl: new URL("cmaps/", pdfjsDist).href,
  standardFontDataUrl: new URL("standard_fonts/", pdfjsDist).href,
  wasmUrl: new URL("wasm/", pdfjsDist).href,
};

export function mergeDocsViewerOptions(
  options: VPdfViewerOptions = {},
): VPdfViewerOptions {
  return {
    smoothJump: false,
    sidebar: "none",
    scale: "page-fit",
    ...options,
    features: {
      textLayer: true,
      annotations: true,
      xfa: true,
      scripting: false,
      ...options.features,
    },
    assets: {
      ...docsPdfAssets,
      ...options.assets,
    },
  };
}
