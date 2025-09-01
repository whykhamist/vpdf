import { defineAsyncComponent } from "vue";

export const VPdf = defineAsyncComponent(() => import("./vPdf.vue"));
export const VPdfPage = defineAsyncComponent(
  () => import("./vPdfPageRenderer.vue"),
);
export const VPdfViewer = defineAsyncComponent(
  () => import("./vPdfViewer.vue"),
);

export default { VPdf, VPdfPage, VPdfViewer };
