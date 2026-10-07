import { computed, markRaw, ref } from "vue";
import { type VPdfPluginDefinition, VPDF_ICON_SLOTS } from "@whykhamist/vpdf";
import PrintProgressOverlay from "./PrintProgressOverlay.vue";
import {
  printPdfDocument,
  VPDF_PRINT_PLUGIN_ID,
  type PrintProgress,
  type VPdfPrintDocument,
  type VPdfPrintPluginOptions,
} from "./printDocument";

const PrintProgressOverlayRaw = markRaw(PrintProgressOverlay);

export {
  printPdfDocument,
  VPDF_PRINT_PLUGIN_ID,
  type PrintPagesOptions,
  type PrintProgress,
  type VPdfPrintDocument,
  type VPdfPrintPage,
  type VPdfPrintPluginOptions,
} from "./printDocument";

export function VPdfPrintPlugin(
  pluginOptions: VPdfPrintPluginOptions = {},
): VPdfPluginDefinition<VPdfPrintPluginOptions> {
  return {
    id: VPDF_PRINT_PLUGIN_ID,
    name: "Print",
    version: "3.0.0",
    options: pluginOptions,
    setup(ctx) {
      const printing = ref(false);
      const printProgress = ref<PrintProgress | undefined>();
      const printAbort = ref<AbortController | undefined>();

      const disposeOverlay = ctx.registerControl({
        id: "progress",
        region: "page-overlay-host",
        order: 100,
        visible: () => printProgress.value !== undefined,
        component: PrintProgressOverlayRaw,
        props: computed(() => ({
          progress: printProgress.value ?? { page: 0, total: 0 },
          onCancel: () => printAbort.value?.abort(),
        })),
      });

      const disposeToolbar = ctx.registerToolbarItem({
        id: "print",
        label: "Print",
        title: "Print",
        icon: VPDF_ICON_SLOTS.print,
        placement: "end",
        order: 50,
        disabled: () =>
          printing.value ||
          ctx.state.value.loadState !== "ready" ||
          !ctx.getDocument(),
        onClick: async () => {
          const documentProxy = ctx.getDocument() as
            | VPdfPrintDocument
            | undefined;
          if (!documentProxy) {
            console.error("[vpdf] print failed: no document loaded");
            return;
          }

          const abort = new AbortController();
          printAbort.value = abort;
          printing.value = true;
          printProgress.value = { page: 0, total: documentProxy.numPages };

          const onCtxAbort = () => abort.abort();
          ctx.signal.addEventListener("abort", onCtxAbort, { once: true });

          try {
            await printPdfDocument(documentProxy, {
              dpi: pluginOptions.dpi,
              title:
                pluginOptions.title ??
                ctx.state.value.meta?.title ??
                "Document",
              signal: abort.signal,
              onProgress: (progress) => {
                printProgress.value = progress;
              },
            });
          } catch (error) {
            if ((error as { name?: string } | undefined)?.name === "AbortError")
              return;
            console.error("[vpdf] print failed", error);
          } finally {
            ctx.signal.removeEventListener("abort", onCtxAbort);
            printing.value = false;
            printProgress.value = undefined;
            printAbort.value = undefined;
          }
        },
      });

      return () => {
        disposeOverlay();
        disposeToolbar();
        printAbort.value?.abort();
      };
    },
  };
}
