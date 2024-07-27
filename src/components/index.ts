import { defineAsyncComponent } from "vue";

export default {
  VPdf: defineAsyncComponent(() => import("./vPdf.vue")),
  VPdfPageRenderer: defineAsyncComponent(
    () => import("./vPdfPageRenderer.vue")
  ),
  VPdfViewer: defineAsyncComponent(() => import("./vPdfViewer.vue")),
};
