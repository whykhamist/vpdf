import { computed, markRaw, ref } from "vue";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/pdf";
import type { VPdfPluginDefinition } from "../types";
import { isToolbarFeatureEnabled } from "../resolve";
import { VPDF_ICON_SLOTS } from "../../icons";
import { VPDF_BUILTIN_PLUGIN_IDS } from "./ids";
import DocumentPropertiesView from "./DocumentPropertiesView.vue";
import {
  buildPropertyRows,
  extractDocumentProperties,
  type DocumentPropertiesPage,
  type DocumentPropertyRow,
} from "./documentPropertiesMeta";

const ViewRaw = markRaw(DocumentPropertiesView);

function asPage(page: unknown): DocumentPropertiesPage | undefined {
  if (!page || typeof page !== "object") return undefined;
  const record = page as {
    view?: number[];
    userUnit?: number;
    rotate?: number;
  };
  if (!Array.isArray(record.view) || record.view.length < 4) return undefined;
  return {
    view: record.view,
    userUnit: typeof record.userUnit === "number" ? record.userUnit : 1,
    rotate: typeof record.rotate === "number" ? record.rotate : 0,
  };
}

function overflowTrigger(
  from: EventTarget | null,
  root?: HTMLElement,
): HTMLElement | undefined {
  const start = from instanceof Element ? from : undefined;
  const inOverflow = start
    ?.closest(".vpdf-overflow")
    ?.querySelector<HTMLElement>("button");
  if (inOverflow) return inOverflow;
  return (
    root?.querySelector<HTMLElement>(".vpdf-overflow > button") ?? undefined
  );
}

export function VPdfDocumentPropertiesPlugin(): VPdfPluginDefinition {
  return {
    id: VPDF_BUILTIN_PLUGIN_IDS.documentProperties,
    name: "Document properties",
    setup(ctx) {
      const status = ref<"loading" | "ready" | "error">("loading");
      const errorMessage = ref<string>();
      const rows = ref<DocumentPropertyRow[]>([]);
      let loadToken = 0;
      let cachedDoc: PDFDocumentProxy | undefined;
      let cachedRows: DocumentPropertyRow[] | undefined;

      const enabled = () =>
        isToolbarFeatureEnabled(ctx.options.value, "documentProperties");

      function viewerRoot(): HTMLElement | undefined {
        const host = ctx.viewerHost.value;
        return (
          (host?.closest("[data-vpdf]") as HTMLElement | undefined) ?? host
        );
      }

      const contentProps = computed(() => ({
        rows: rows.value,
        status: status.value,
        errorMessage: errorMessage.value,
      }));

      function showModal(restoreFocus?: HTMLElement) {
        ctx.openModal({
          component: ViewRaw,
          props: contentProps,
          busy: () => status.value === "loading",
          restoreFocus,
        });
      }

      async function loadRows(
        pdf: PDFDocumentProxy,
        token: number,
      ): Promise<DocumentPropertyRow[]> {
        if (cachedDoc === pdf && cachedRows) return cachedRows;
        let page: DocumentPropertiesPage | undefined;
        try {
          page = asPage(await ctx.getPage(1));
        } catch {
          page = undefined;
        }
        const extracted = await extractDocumentProperties({
          source: {
            numPages: pdf.numPages,
            async getMetadata() {
              const metadata = await pdf.getMetadata();
              return metadata as unknown as {
                info?: Record<string, unknown>;
                contentLength?: number | null;
                hasStructTree?: boolean;
              };
            },
            getMarkInfo: () => pdf.getMarkInfo(),
            getDownloadInfo: () => pdf.getDownloadInfo(),
          },
          page,
          progressTotal: ctx.state.value.progress.total,
          locale: ctx.options.value.locale,
        });
        if (token !== loadToken) return [];
        const next = buildPropertyRows(extracted);
        cachedDoc = pdf;
        cachedRows = next;
        return next;
      }

      async function openDialog(event?: Event) {
        if (!enabled() || ctx.state.value.loadState !== "ready") return;
        const pdf = ctx.getDocument();
        if (!pdf) return;
        const token = ++loadToken;
        showModal(
          overflowTrigger(
            event?.target ?? document.activeElement,
            viewerRoot(),
          ),
        );
        if (cachedDoc === pdf && cachedRows) {
          rows.value = cachedRows;
          status.value = "ready";
          errorMessage.value = undefined;
          return;
        }
        status.value = "loading";
        errorMessage.value = undefined;
        rows.value = [];
        try {
          const next = await loadRows(pdf, token);
          if (token !== loadToken) return;
          rows.value = next;
          status.value = "ready";
        } catch {
          if (token !== loadToken) return;
          rows.value = buildPropertyRows({
            pageCount: String(pdf.numPages || ctx.state.value.pageCount || ""),
          });
          status.value = "error";
          errorMessage.value = "Could not read document properties.";
        }
      }

      const disposeMenu = ctx.registerMenuItem({
        id: "menu",
        label: "Properties",
        icon: VPDF_ICON_SLOTS.properties,
        order: 50,
        visible: enabled,
        disabled: () => ctx.state.value.loadState !== "ready",
        onClick: () => openDialog(),
      });

      const disposeClose = ctx.on("onDocumentClose", () => {
        loadToken += 1;
        cachedDoc = undefined;
        cachedRows = undefined;
        ctx.closeModal();
      });

      return () => {
        disposeMenu();
        disposeClose();
        ctx.closeModal();
      };
    },
  };
}
