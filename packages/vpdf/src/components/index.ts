import { defineAsyncComponent } from "vue";
import { usePdf, usePdfViewer } from "../composables";

export { usePdf, usePdfViewer };

export default {
  VPdf: defineAsyncComponent(() => import("./vPdf.vue")),
  VPdfPageRenderer: defineAsyncComponent(
    () => import("./vPdfPageRenderer.vue")
  ),
  VPdfViewer: defineAsyncComponent(() => import("./vPdfViewer.vue")),
};
