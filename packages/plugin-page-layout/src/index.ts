import { computed, markRaw, ref } from "vue";
import type { VPdfPluginDefinition } from "@whykhamist/vpdf";
import PageLayoutSelect from "./PageLayoutSelect.vue";

const PageLayoutSelectRaw = markRaw(PageLayoutSelect);

/** Matches pdfjs-dist `ScrollMode` numeric values. */
export const PDFJS_SCROLL_MODE = {
  VERTICAL: 0,
  HORIZONTAL: 1,
  WRAPPED: 2,
  PAGE: 3,
} as const;

/** Matches pdfjs-dist `SpreadMode` numeric values. */
export const PDFJS_SPREAD_MODE = {
  NONE: 0,
  /** Pairs 1–2, 3–4, … (`SpreadMode.ODD`) */
  ODD: 1,
  EVEN: 2,
} as const;

export type VPdfPageLayoutMode =
  | "vertical"
  | "horizontal"
  | "two-column"
  | "wrapped"
  | "single-page";

export interface VPdfPageLayoutPluginOptions {
  defaultMode?: VPdfPageLayoutMode;
}

export interface VPdfPageLayoutState {
  mode: VPdfPageLayoutMode;
}

export interface VPdfPageLayoutMapping {
  scrollMode: number;
  spreadMode: number;
}

export const PAGE_LAYOUT_OPTIONS: ReadonlyArray<{
  value: VPdfPageLayoutMode;
  label: string;
}> = [
  { value: "vertical", label: "Vertical" },
  { value: "single-page", label: "Single page" },
  { value: "horizontal", label: "Horizontal" },
  { value: "two-column", label: "Two columns" },
  { value: "wrapped", label: "Fill width" },
];

interface PdfJsLayoutViewer {
  scrollMode: number;
  spreadMode: number;
}

export function mapPageLayoutMode(
  mode: VPdfPageLayoutMode,
): VPdfPageLayoutMapping {
  switch (mode) {
    case "horizontal":
      return {
        scrollMode: PDFJS_SCROLL_MODE.HORIZONTAL,
        spreadMode: PDFJS_SPREAD_MODE.NONE,
      };
    case "two-column":
      return {
        scrollMode: PDFJS_SCROLL_MODE.VERTICAL,
        spreadMode: PDFJS_SPREAD_MODE.ODD,
      };
    case "wrapped":
      return {
        scrollMode: PDFJS_SCROLL_MODE.WRAPPED,
        spreadMode: PDFJS_SPREAD_MODE.NONE,
      };
    case "single-page":
      return {
        scrollMode: PDFJS_SCROLL_MODE.PAGE,
        spreadMode: PDFJS_SPREAD_MODE.NONE,
      };
    default:
      return {
        scrollMode: PDFJS_SCROLL_MODE.VERTICAL,
        spreadMode: PDFJS_SPREAD_MODE.NONE,
      };
  }
}

function asLayoutViewer(value: unknown): PdfJsLayoutViewer | undefined {
  if (!value || typeof value !== "object") return undefined;
  if (!("scrollMode" in value) || !("spreadMode" in value)) return undefined;
  return value as PdfJsLayoutViewer;
}

export function applyPageLayout(
  viewer: unknown,
  mode: VPdfPageLayoutMode,
): boolean {
  const pdfViewer = asLayoutViewer(viewer);
  if (!pdfViewer) return false;
  const { scrollMode, spreadMode } = mapPageLayoutMode(mode);
  if (
    scrollMode === PDFJS_SCROLL_MODE.HORIZONTAL ||
    scrollMode === PDFJS_SCROLL_MODE.PAGE
  ) {
    pdfViewer.spreadMode = PDFJS_SPREAD_MODE.NONE;
    pdfViewer.scrollMode = scrollMode;
    return true;
  }
  pdfViewer.scrollMode = scrollMode;
  pdfViewer.spreadMode = spreadMode;
  return true;
}

export function VPdfPageLayoutPlugin(
  pluginOptions: VPdfPageLayoutPluginOptions = {},
): VPdfPluginDefinition<VPdfPageLayoutPluginOptions, VPdfPageLayoutState> {
  const defaultMode = pluginOptions.defaultMode ?? "vertical";

  return {
    id: "page-layout",
    name: "Page layout",
    version: "3.0.0",
    options: pluginOptions,
    createState: () => ({ mode: defaultMode }),
    setup(ctx) {
      const mode = ref<VPdfPageLayoutMode>(
        ctx.getPluginState<VPdfPageLayoutState>()?.mode ?? defaultMode,
      );
      const ready = ref(false);

      const apply = (next: VPdfPageLayoutMode = mode.value) => {
        applyPageLayout(ctx.controller.getExperimentalViewer(), next);
      };

      const setMode = (next: VPdfPageLayoutMode) => {
        mode.value = next;
        ctx.setPluginState({ mode: next });
        apply(next);
      };

      const disposeToolbar = ctx.registerToolbarItem({
        id: "layout",
        kind: "control",
        placement: "end",
        order: 40,
        component: PageLayoutSelectRaw,
        props: computed(() => ({
          mode: mode.value,
          disabled: !ready.value,
          onChange: setMode,
        })),
      });

      const disposeReady = ctx.on("onReady", () => {
        ready.value = true;
        apply();
      });

      const disposeClose = ctx.on("onDocumentClose", () => {
        ready.value = false;
      });

      return () => {
        applyPageLayout(ctx.controller.getExperimentalViewer(), "vertical");
        disposeToolbar();
        disposeReady();
        disposeClose();
      };
    },
  };
}

export { VPdfPageLayoutPlugin as createPageLayoutPlugin };
