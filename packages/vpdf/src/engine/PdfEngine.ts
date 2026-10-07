/**
 * PDF.js engine adapter.
 * Dynamically imports pdfjs-dist only in the browser after mount.
 */

import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist/types/src/pdf";
import type {
  VPdfAnnotationChangeEvent,
  VPdfAnnotationEditorKind,
  VPdfAnnotationEditorMode,
  VPdfAnnotationEditorParams,
  VPdfAnnotationEditorUi,
  VPdfAttachment,
  VPdfDocumentInitOptions,
  VPdfDocumentMeta,
  VPdfErrorEvent,
  VPdfPrepareDocumentInitEvent,
  VPdfFindEventType,
  VPdfFindOptions,
  VPdfOutlineItem,
  VPdfPageGeometry,
  VPdfPasswordReason,
  VPdfPasswordRequest,
  VPdfProgressEvent,
  VPdfSource,
  VPdfViewerOptions,
} from "../types";
import {
  DEFAULT_EXTERNAL_LINKS,
  DEFAULT_FEATURES,
  EDITOR_MODE_TO_PDFJS,
  PDFJS_TO_EDITOR_MODE,
} from "../utils/defaults";
import {
  annotationParamsFromPdfjs,
  asAnnotationEditorKind,
  createInitialAnnotationEditorUi,
  editorKindFromMode,
  pdfjsCommandsForParams,
} from "../utils/annotationEditor";
import { resolveAssetUrls } from "../utils/assets";
import { buildDocumentInitParameters } from "../utils/documentInit";
import {
  isMatchRecountFindType,
  searchPatchFromFindControlState,
} from "../plugins/builtins/searchOptions";
import {
  downloadBlob,
  normalizeSource,
  revokeObjectUrl,
  type NormalizedSource,
} from "../utils/source";
import {
  applyDestinationScrollOffset,
  resolveDestinationOffset,
} from "../utils/pageChrome";
import { MAX_SCALE, MIN_SCALE } from "../utils/zoom";
import {
  captureTextSelection,
  getSelectionPageNumbers,
  restoreTextSelection,
  type TextSelectionSnapshot,
} from "../utils/textSelection";
import {
  pageJumpScrollOffset,
  PageVirtualScroll,
  PDFJS_PAGE_SCROLL_MODE,
} from "./pageVirtualScroll";
import { SmoothJumpLock } from "./smoothJumpLock";

export interface EngineCallbacks {
  onLoadState: (
    state: "loading" | "password" | "ready" | "error" | "unsupported" | "idle",
  ) => void;
  onProgress: (progress: VPdfProgressEvent) => void;
  onPassword: (request: VPdfPasswordRequest) => void;
  onError: (error: VPdfErrorEvent) => void;
  onDocumentMeta: (meta: VPdfDocumentMeta) => void;
  onOutline: (outline: VPdfOutlineItem[]) => void;
  onAttachments: (attachments: VPdfAttachment[]) => void;
  onPageChange: (pageNumber: number, pageCount: number) => void;
  onScaleChange: (scale: number, preset?: string) => void;
  onRotationChange: (rotation: 0 | 90 | 180 | 270) => void;
  onAnnotationChange: (event: VPdfAnnotationChangeEvent) => void;
  onAnnotationEditorUi: (ui: VPdfAnnotationEditorUi) => void;
  onSearchUpdate: (
    patch: Partial<{
      matchCount: number;
      currentMatch: number;
      status: "idle" | "pending" | "found" | "not-found" | "wrapped";
    }>,
  ) => void;
  onModifications: (dirty: boolean) => void;
  onReady: () => void;
  onDocumentClose: () => void;
  onPrepareDocumentInit?: (event: VPdfPrepareDocumentInitEvent) => void;
}

type PdfjsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
type ViewerModule = typeof import("pdfjs-dist/legacy/web/pdf_viewer.mjs");

export class PdfEngine {
  private pdfjs?: PdfjsModule;
  private viewerMod?: ViewerModule;
  private eventBus?: InstanceType<ViewerModule["EventBus"]>;
  private linkService?: InstanceType<ViewerModule["PDFLinkService"]>;
  private findController?: InstanceType<ViewerModule["PDFFindController"]>;
  private pdfViewer?: InstanceType<ViewerModule["PDFViewer"]>;
  private loadingTask?: import("pdfjs-dist").PDFDocumentLoadingTask;
  private pdfDocument?: PDFDocumentProxy;
  private objectUrl?: string;
  private filename = "document.pdf";
  private scrollContainer?: HTMLDivElement;
  private viewerElement?: HTMLElement;
  private destroyed = false;
  private passwordResolver?: {
    resolve: (password: string) => void;
    reject: (reason?: unknown) => void;
  };
  private listeners: Array<() => void> = [];
  private pendingSelectionSnapshot?: TextSelectionSnapshot;
  private restoreSelectionAttempts = 0;
  private restoreSelectionTimer?: ReturnType<typeof setTimeout>;
  private pointerSelecting = false;
  private readonly maxRestoreSelectionAttempts = 24;
  private readonly virtualScroll = new PageVirtualScroll();
  private readonly jumpLock = new SmoothJumpLock();
  private lastFindOptions?: VPdfFindOptions;
  private annotationEditorUiManager?: {
    delete: () => void;
    firstSelectedEditor?: { editorType?: string };
  };
  private annotationEditorUi: VPdfAnnotationEditorUi =
    createInitialAnnotationEditorUi();
  private editorParamsByKind: Partial<
    Record<VPdfAnnotationEditorKind, VPdfAnnotationEditorParams>
  > = {};

  constructor(
    private readonly getOptions: () => VPdfViewerOptions,
    private readonly callbacks: EngineCallbacks,
  ) {}

  async mount(container: HTMLElement): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("[vpdf] PdfEngine requires a browser environment");
    }

    const scroll = container.querySelector(
      ".vpdf-viewer-scroll",
    ) as HTMLDivElement | null;
    const pages = container.querySelector(
      ".vpdf-viewer-pages",
    ) as HTMLDivElement | null;
    if (!scroll || !pages) {
      throw new Error(
        "[vpdf] viewer host is missing .vpdf-viewer-scroll / .vpdf-viewer-pages",
      );
    }
    this.scrollContainer = scroll;
    this.viewerElement = pages;

    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const viewerMod = await import("pdfjs-dist/legacy/web/pdf_viewer.mjs");

    this.pdfjs = pdfjs;
    this.viewerMod = viewerMod;

    const assets = resolveAssetUrls(this.getOptions().assets);
    pdfjs.GlobalWorkerOptions.workerSrc = assets.workerSrc;

    const { EventBus, PDFLinkService, PDFFindController } = viewerMod;
    this.eventBus = new EventBus();
    this.linkService = new PDFLinkService({
      eventBus: this.eventBus,
      externalLinkTarget: this.mapExternalLinkTarget(),
      externalLinkRel:
        this.getOptions().externalLinks?.rel ?? DEFAULT_EXTERNAL_LINKS.rel,
    });
    this.linkService.externalLinkEnabled =
      this.getOptions().externalLinks?.enabled ??
      DEFAULT_EXTERNAL_LINKS.enabled;

    this.findController = new PDFFindController({
      eventBus: this.eventBus,
      linkService: this.linkService,
    });

    this.pdfViewer = this.createPdfViewer(scroll, pages);

    this.linkService.setViewer(this.pdfViewer);
    this.bindEvents();
    this.bindSelectionPreservation();
    this.containFindMatchScroll();
  }

  private createPdfViewer(
    scroll: HTMLDivElement,
    pages: HTMLDivElement,
  ): InstanceType<ViewerModule["PDFViewer"]> {
    const pdfjs = this.pdfjs!;
    const viewerMod = this.viewerMod!;
    const assets = resolveAssetUrls(this.getOptions().assets);
    const textLayerEnabled =
      this.getOptions().features?.textLayer ?? DEFAULT_FEATURES.textLayer;

    return new viewerMod.PDFViewer({
      container: scroll,
      viewer: pages,
      eventBus: this.eventBus!,
      linkService: this.linkService!,
      findController: this.findController!,
      textLayerMode: textLayerEnabled ? 1 : 0,
      annotationMode:
        (this.getOptions().features?.annotationLayer ??
        DEFAULT_FEATURES.annotationLayer)
          ? pdfjs.AnnotationMode.ENABLE_FORMS
          : pdfjs.AnnotationMode.DISABLE,
      annotationEditorMode:
        EDITOR_MODE_TO_PDFJS[
          this.getOptions().annotationEditorMode ?? "none"
        ] ?? 0,
      imageResourcesPath: assets.imageResourcesPath,
    });
  }

  async load(
    source: VPdfSource,
    password?: string,
    documentInit?: VPdfDocumentInitOptions,
  ): Promise<void> {
    if (!this.pdfjs || !this.pdfViewer) {
      throw new Error("[vpdf] engine not mounted");
    }

    const preservedScale =
      this.pdfViewer.currentScaleValue ?? this.pdfViewer.currentScale;

    await this.closeDocument();
    this.callbacks.onLoadState("loading");

    let normalized: NormalizedSource;
    try {
      normalized = normalizeSource(source);
    } catch (error) {
      this.fail("SOURCE_INVALID", "Unsupported PDF source", error);
      return;
    }

    this.objectUrl = normalized.objectUrl;
    this.filename = normalized.filename ?? "document.pdf";

    const features = { ...DEFAULT_FEATURES, ...this.getOptions().features };
    const assets = resolveAssetUrls(this.getOptions().assets);
    const options = this.getOptions();

    const docParams = buildDocumentInitParameters({
      assets,
      features,
      normalized,
      source,
      password,
      viewer: options.documentInit,
      perLoad: documentInit,
      prepare: this.callbacks.onPrepareDocumentInit,
    });

    try {
      this.loadingTask = this.pdfjs.getDocument(
        docParams as Parameters<typeof this.pdfjs.getDocument>[0],
      );
      this.loadingTask.onProgress = (progress: {
        loaded: number;
        total: number;
      }) => {
        this.callbacks.onProgress({
          loaded: progress.loaded,
          total: progress.total || 0,
        });
      };

      this.loadingTask.onPassword = (
        updateCallback: (password: string | Error) => void,
        reason: number,
      ) => {
        const passwordReason: VPdfPasswordReason =
          reason === this.pdfjs!.PasswordResponses.INCORRECT_PASSWORD
            ? "incorrect"
            : "need";

        this.callbacks.onLoadState("password");
        this.callbacks.onPassword({
          reason: passwordReason,
          submit: (value) => {
            updateCallback(value);
            this.callbacks.onLoadState("loading");
          },
          cancel: () => {
            void this.closeDocument().then(() => {
              this.callbacks.onLoadState("idle");
            });
          },
        });
      };

      const pdfDocument = await this.loadingTask.promise;
      if (this.destroyed) {
        try {
          await this.loadingTask.destroy();
        } catch {
          // ignore
        }
        return;
      }

      this.pdfDocument = pdfDocument;
      const pagesInit = this.waitForPagesInit();
      this.pdfViewer.setDocument(pdfDocument);
      await pagesInit;
      this.setScale(this.getOptions().scale ?? preservedScale);
      this.linkService?.setDocument(pdfDocument);

      const meta = await this.readMeta(pdfDocument);
      this.callbacks.onDocumentMeta(meta);

      if (features.outline !== false) {
        const outline = await this.readOutline(pdfDocument);
        this.callbacks.onOutline(outline);
      }

      if (features.attachments !== false) {
        const attachments = await this.readAttachments(pdfDocument);
        this.callbacks.onAttachments(attachments);
        void this.hydrateAttachmentSizes(pdfDocument, attachments);
      }

      if (meta.isPureXfa && features.xfa === false) {
        this.callbacks.onLoadState("unsupported");
        this.callbacks.onError({
          code: "XFA_UNSUPPORTED",
          message:
            "This document is a pure XFA PDF and XFA rendering is disabled.",
        });
        return;
      }

      this.callbacks.onLoadState("ready");
      this.callbacks.onPageChange(1, pdfDocument.numPages);
      this.callbacks.onReady();
      this.callbacks.onDocumentMeta(meta);
    } catch (error) {
      if (this.destroyed) return;
      const message =
        error instanceof Error ? error.message : "Failed to load PDF";
      if (/password/i.test(message)) {
        // password flow already surfaced
        return;
      }
      this.fail("LOAD_FAILED", message, error);
    }
  }

  async closeDocument(): Promise<void> {
    this.jumpLock.stop();
    this.virtualScroll.disable();
    this.passwordResolver?.reject();
    this.passwordResolver = undefined;

    if (this.pdfViewer) {
      try {
        this.pdfViewer.setDocument(null as never);
      } catch {
        // ignore
      }
    }
    this.linkService?.setDocument(null as never);

    if (this.loadingTask) {
      try {
        await this.loadingTask.destroy();
      } catch {
        // ignore
      }
      this.loadingTask = undefined;
    }

    if (this.pdfDocument) {
      this.pdfDocument = undefined;
    }

    revokeObjectUrl(this.objectUrl);
    this.objectUrl = undefined;
    this.callbacks.onOutline([]);
    this.callbacks.onAttachments([]);
    this.callbacks.onModifications(false);
    this.annotationEditorUiManager = undefined;
    this.editorParamsByKind = {};
    this.setAnnotationEditorUi(createInitialAnnotationEditorUi());
    this.callbacks.onDocumentClose();
  }

  async destroy(): Promise<void> {
    this.destroyed = true;
    this.virtualScroll.disable();
    for (const off of this.listeners.splice(0)) off();
    await this.closeDocument();
    this.pdfViewer = undefined;
    this.findController = undefined;
    this.linkService = undefined;
    this.eventBus = undefined;
  }

  private shouldSmoothJump(): boolean {
    return (
      this.getOptions().smoothJump === true && !this.virtualScroll.isEnabled
    );
  }

  private navigationPage(): number {
    return this.jumpLock.page ?? this.pdfViewer?.currentPageNumber ?? 1;
  }

  private waitForPagesInit(): Promise<void> {
    const bus = this.eventBus;
    if (!bus) return Promise.resolve();
    return new Promise((resolve) => {
      const handler = () => {
        bus.off("pagesinit", handler as never);
        resolve();
      };
      bus.on("pagesinit", handler as never);
    });
  }

  private announcePage(pageNumber: number): void {
    this.callbacks.onPageChange(pageNumber, this.pdfDocument?.numPages ?? 0);
  }

  private beginSmoothJumpLock(page: number): void {
    const scroll = this.scrollContainer;
    if (!scroll) {
      this.announcePage(page);
      return;
    }
    this.jumpLock.start(page, scroll, () => {
      this.announcePage(this.pdfViewer?.currentPageNumber ?? page);
    });
    this.announcePage(page);
  }

  private async resolveExplicitDestination(
    dest: string | unknown[],
  ): Promise<unknown[] | undefined> {
    if (!this.pdfDocument) return undefined;
    let explicitDest: unknown;
    if (typeof dest === "string") {
      explicitDest = await this.pdfDocument.getDestination(dest);
    } else {
      explicitDest = dest;
    }
    return Array.isArray(explicitDest) ? explicitDest : undefined;
  }

  private resolveDestinationPageFromExplicit(
    explicitDest: unknown[],
  ): number | undefined {
    if (!this.pdfDocument) return undefined;
    const destRef = explicitDest[0];
    if (destRef && typeof destRef === "object") {
      const cached = this.pdfDocument.cachedPageNumber(destRef as never);
      if (cached) return cached;
      return undefined;
    }
    if (Number.isInteger(destRef)) return (destRef as number) + 1;
    return undefined;
  }

  private async resolveDestinationPage(
    dest: string | unknown[],
  ): Promise<number | undefined> {
    const explicitDest = await this.resolveExplicitDestination(dest);
    if (!explicitDest) return undefined;
    const destRef = explicitDest[0];
    if (destRef && typeof destRef === "object") {
      const cached = this.pdfDocument?.cachedPageNumber(destRef as never);
      if (cached) return cached;
      try {
        return (await this.pdfDocument!.getPageIndex(destRef as never)) + 1;
      } catch {
        return undefined;
      }
    }
    return this.resolveDestinationPageFromExplicit(explicitDest);
  }

  private measureDestinationScrollHidden(
    explicitDest: unknown[],
    pageNumber: number,
    resetTop: number,
    resetLeft: number,
  ): { top: number; left: number } | undefined {
    const scroll = this.scrollContainer;
    const pdfViewer = this.pdfViewer;
    if (!scroll || !pdfViewer) return undefined;

    const ignoreDestinationZoom =
      (this.linkService as { _ignoreDestinationZoom?: boolean })
        ._ignoreDestinationZoom ?? false;

    const previousVisibility = scroll.style.visibility;
    scroll.style.visibility = "hidden";
    scroll.style.scrollBehavior = "auto";
    try {
      pdfViewer.scrollPageIntoView({
        pageNumber,
        destArray: explicitDest as never,
        ignoreDestinationZoom,
      });
      const top = scroll.scrollTop;
      const left = scroll.scrollLeft;
      scroll.scrollTop = resetTop;
      scroll.scrollLeft = resetLeft;
      return { top, left };
    } finally {
      scroll.style.visibility = previousVisibility;
      scroll.style.scrollBehavior = "";
    }
  }

  private pushDestinationHistory(
    dest: string | unknown[],
    explicitDest: unknown[],
    pageNumber: number,
  ): void {
    const history = (
      this.linkService as {
        pdfHistory?: {
          pushCurrentPosition: () => void;
          push: (entry: unknown) => void;
        };
      }
    ).pdfHistory;
    if (!history) return;
    const namedDest = typeof dest === "string" ? dest : null;
    history.pushCurrentPosition();
    history.push({ namedDest, explicitDest, pageNumber });
  }

  private getPageScrollOffset(
    pageDiv: HTMLDivElement,
    scroll: HTMLDivElement,
  ): { offsetY: number; offsetX: number } | null {
    let parent = pageDiv.offsetParent as HTMLElement | null;
    if (!parent) return null;

    let offsetY = pageDiv.offsetTop + pageDiv.clientTop;
    let offsetX = pageDiv.offsetLeft + pageDiv.clientLeft;

    while (
      parent !== scroll &&
      parent.clientHeight === parent.scrollHeight &&
      parent.clientWidth === parent.scrollWidth
    ) {
      offsetY += parent.offsetTop;
      offsetX += parent.offsetLeft;
      parent = parent.offsetParent as HTMLElement | null;
      if (!parent) return null;
    }

    if (parent !== scroll) {
      let el: HTMLElement | null = parent;
      while (el && el !== scroll) {
        offsetY += el.offsetTop;
        offsetX += el.offsetLeft;
        el = el.offsetParent as HTMLElement | null;
      }
    }

    return { offsetY, offsetX };
  }

  private jumpToPage(pageNumber: number): void {
    if (!this.pdfViewer || !this.pdfDocument) return;
    const page = Math.min(Math.max(1, pageNumber), this.pdfDocument.numPages);
    const scroll = this.scrollContainer;

    if (this.virtualScroll.isEnabled) {
      this.virtualScroll.goToPage(
        page,
        this.shouldSmoothJump() ? "smooth" : "auto",
      );
      return;
    }

    if (!scroll) {
      this.pdfViewer.currentPageNumber = page;
      return;
    }

    const viewer = this.pdfViewer as unknown as {
      currentPageNumber: number;
      _setCurrentPageNumber(
        val: number,
        resetCurrentPageView?: boolean,
      ): boolean;
      getPageView(index: number): { div: HTMLDivElement } | null | undefined;
    };
    const pageView = viewer.getPageView(page - 1);
    if (!pageView?.div) {
      this.pdfViewer.currentPageNumber = page;
      return;
    }

    const div = pageView.div;
    const offset = this.getPageScrollOffset(div, scroll);
    if (!offset) {
      this.pdfViewer.currentPageNumber = page;
      return;
    }

    const top = pageJumpScrollOffset(
      offset.offsetY,
      div.clientHeight,
      scroll.clientHeight,
    );
    const left = pageJumpScrollOffset(
      offset.offsetX,
      div.clientWidth,
      scroll.clientWidth,
    );
    const smooth =
      this.shouldSmoothJump() &&
      (Math.abs(scroll.scrollTop - top) > 1 ||
        Math.abs(scroll.scrollLeft - left) > 1);

    if (smooth) this.beginSmoothJumpLock(page);

    if (!viewer._setCurrentPageNumber(page, false)) {
      this.jumpLock.stop();
      console.error(`jumpToPage: "${page}" is not a valid page.`);
      return;
    }

    scroll.scrollTo({
      top,
      left,
      behavior: smooth ? "smooth" : "auto",
    });
  }

  goToPage(pageNumber: number): void {
    this.jumpToPage(pageNumber);
  }

  nextPage(): void {
    if (!this.pdfViewer) return;
    this.jumpToPage(this.navigationPage() + 1);
  }

  previousPage(): void {
    if (!this.pdfViewer) return;
    this.jumpToPage(this.navigationPage() - 1);
  }

  async goToDestination(dest: string | unknown[]): Promise<void> {
    const scroll = this.scrollContainer;
    const pdfViewer = this.pdfViewer;

    if (!this.linkService) return;

    if (scroll && pdfViewer) {
      const explicitDest = await this.resolveExplicitDestination(dest);
      if (explicitDest) {
        let page = this.resolveDestinationPageFromExplicit(explicitDest);
        if (!page) page = await this.resolveDestinationPage(dest);
        if (page) {
          const topBefore = scroll.scrollTop;
          const leftBefore = scroll.scrollLeft;
          const target = this.measureDestinationScrollHidden(
            explicitDest,
            page,
            topBefore,
            leftBefore,
          );
          if (target) {
            const top = applyDestinationScrollOffset(
              target.top,
              resolveDestinationOffset(
                this.getOptions().destinationOffset,
                pdfViewer.currentScale,
              ),
            );
            const left = target.left;
            const moved =
              Math.abs(top - topBefore) > 1 || Math.abs(left - leftBefore) > 1;
            const smooth = this.shouldSmoothJump() && moved;

            if (smooth) this.beginSmoothJumpLock(page);

            const viewer = pdfViewer as unknown as {
              _setCurrentPageNumber(val: number, reset?: boolean): boolean;
            };
            if (!viewer._setCurrentPageNumber(page, false)) {
              this.jumpLock.stop();
              console.error(`goToDestination: "${page}" is not a valid page.`);
              return;
            }

            this.pushDestinationHistory(dest, explicitDest, page);

            scroll.scrollTo({
              top,
              left,
              behavior: smooth ? "smooth" : "auto",
            });
            return;
          }
        }
      }
    }

    await this.linkService.goToDestination(dest as never);
  }

  setScale(scale: number | string): void {
    if (!this.pdfViewer) return;
    const snapshot = captureTextSelection();
    if (snapshot) {
      this.pendingSelectionSnapshot = snapshot;
      this.restoreSelectionAttempts = 0;
    }
    if (typeof scale === "number") {
      this.pdfViewer.currentScale = scale;
    } else {
      this.pdfViewer.currentScaleValue = scale;
    }
    if (snapshot) {
      this.scheduleSelectionRestore();
    }
  }

  zoomIn(step = 0.1): void {
    if (!this.pdfViewer) return;
    this.setScale(Math.min(MAX_SCALE, this.pdfViewer.currentScale + step));
  }

  zoomOut(step = 0.1): void {
    if (!this.pdfViewer) return;
    this.setScale(Math.max(MIN_SCALE, this.pdfViewer.currentScale - step));
  }

  rotate(delta: 90 | -90 = 90): void {
    if (!this.pdfViewer) return;
    const next = (((this.pdfViewer.pagesRotation + delta) % 360) + 360) % 360;
    this.pdfViewer.pagesRotation = next as 0 | 90 | 180 | 270;
    this.callbacks.onRotationChange(next as 0 | 90 | 180 | 270);
  }

  setAnnotationEditorMode(mode: VPdfAnnotationEditorMode): void {
    if (!this.pdfViewer) return;
    const value = EDITOR_MODE_TO_PDFJS[mode] ?? 0;
    this.pdfViewer.annotationEditorMode = { mode: value } as never;
  }

  updateAnnotationEditor(patch: VPdfAnnotationEditorParams): void {
    if (!this.eventBus) return;
    const editorType =
      this.annotationEditorUi.editorType ??
      this.selectedEditorKind() ??
      editorKindFromMode(this.currentEditorMode());
    this.setAnnotationEditorUi({
      ...this.annotationEditorUi,
      editorType,
      params: this.mergeEditorParams(editorType, patch),
    });
    for (const command of pdfjsCommandsForParams(editorType, patch)) {
      this.eventBus.dispatch("switchannotationeditorparams", command);
    }
  }

  deleteSelectedAnnotation(): void {
    this.annotationEditorUiManager?.delete();
  }

  find(options: VPdfFindOptions): void {
    if (!this.eventBus) return;
    this.lastFindOptions = options;
    const type = options.type ?? "";
    if (isMatchRecountFindType(type)) {
      this.callbacks.onSearchUpdate({
        status: "pending",
        matchCount: 0,
        currentMatch: 0,
      });
    }
    this.dispatchFindEvent(type, options.findPrevious ?? false, options);
  }

  findNext(): void {
    if (!this.eventBus || !this.lastFindOptions) return;
    this.dispatchFindEvent("again", false);
  }

  findPrevious(): void {
    if (!this.eventBus || !this.lastFindOptions) return;
    this.dispatchFindEvent("again", true);
  }

  clearFind(): void {
    this.eventBus?.dispatch("findbarclose", {});
    this.lastFindOptions = undefined;
    this.callbacks.onSearchUpdate({
      matchCount: 0,
      currentMatch: 0,
      status: "idle",
    });
  }

  private dispatchFindEvent(
    type: VPdfFindEventType,
    findPrevious: boolean,
    options?: VPdfFindOptions,
  ): void {
    if (!this.eventBus) return;
    const resolved = options ?? this.lastFindOptions;
    if (!resolved?.query) return;
    this.eventBus.dispatch("find", {
      type,
      query: resolved.query,
      caseSensitive: resolved.caseSensitive ?? false,
      entireWord: resolved.entireWord ?? false,
      highlightAll: resolved.highlightAll ?? true,
      findPrevious,
      matchDiacritics: resolved.matchDiacritics ?? false,
    });
  }

  getDocument(): PDFDocumentProxy | undefined {
    return this.pdfDocument;
  }

  async getPage(pageNumber: number): Promise<PDFPageProxy | undefined> {
    if (!this.pdfDocument) return undefined;
    if (pageNumber < 1 || pageNumber > this.pdfDocument.numPages)
      return undefined;
    return this.pdfDocument.getPage(pageNumber);
  }

  getPageGeometry(pageNumber: number): VPdfPageGeometry | undefined {
    const view = this.pdfViewer?.getPageView(pageNumber - 1) as
      | {
          viewport?: {
            width: number;
            height: number;
            scale: number;
            rotation: number;
            transform: number[];
          };
        }
      | undefined;
    if (!view?.viewport) return undefined;
    const { width, height, scale, rotation, transform } = view.viewport;
    return { pageNumber, width, height, scale, rotation, transform };
  }

  getExperimentalViewer(): unknown {
    return this.pdfViewer;
  }

  private enableVirtualScroll(): void {
    const pdfViewer = this.pdfViewer;
    const scroll = this.scrollContainer;
    const pages = this.viewerElement;
    const engine = this;
    if (!pdfViewer || !scroll || !pages) return;
    this.virtualScroll.enable(scroll, pages, {
      get currentPageNumber() {
        return pdfViewer.currentPageNumber;
      },
      set currentPageNumber(value) {
        pdfViewer.currentPageNumber = value;
      },
      get pagesCount() {
        return pdfViewer.pagesCount || engine.pdfDocument?.numPages || 0;
      },
      getPageView: (index) => pdfViewer.getPageView(index),
      forceRenderPage(pageNumber: number) {
        const pageView = pdfViewer.getPageView(pageNumber - 1) as
          | { id?: number }
          | undefined;
        if (!pageView) return;
        const id = pageView.id ?? pageNumber;
        const visiblePage = {
          id,
          x: 0,
          y: 0,
          visibleArea: null,
          view: pageView,
          percent: 100,
          widthPercent: 100,
        };
        const visible = {
          first: visiblePage,
          last: visiblePage,
          views: [visiblePage],
          ids: new Set([id]),
        };
        (
          pdfViewer as { forceRendering?: (pages: typeof visible) => boolean }
        ).forceRendering?.(visible);
      },
    });
  }

  async downloadOriginal(filename = this.filename): Promise<void> {
    if (!this.pdfDocument) return;
    const data = await this.pdfDocument.getData();
    downloadBlob(toArrayBuffer(data), filename);
  }

  async saveModified(filename = this.filename): Promise<Uint8Array> {
    if (!this.pdfDocument) {
      throw new Error("[vpdf] no document loaded");
    }
    // saveDocument returns modified PDF when forms/editors changed
    const data =
      (await (
        this.pdfDocument as PDFDocumentProxy & {
          saveDocument?: () => Promise<Uint8Array>;
        }
      ).saveDocument?.()) ?? (await this.pdfDocument.getData());
    downloadBlob(toArrayBuffer(data), filename);
    this.callbacks.onModifications(false);
    return data;
  }

  getFilename(): string {
    return this.filename;
  }

  private scheduleSelectionRestore(): void {
    if (!this.pendingSelectionSnapshot || !this.scrollContainer) return;

    const snapshot = this.pendingSelectionSnapshot;
    const attemptRestore = () => {
      if (!this.pendingSelectionSnapshot || !this.scrollContainer) return;

      const restored = restoreTextSelection(this.scrollContainer, snapshot);
      if (restored) {
        this.pendingSelectionSnapshot = undefined;
        this.restoreSelectionAttempts = 0;
        this.restoreSelectionTimer = undefined;
        return;
      }

      this.restoreSelectionAttempts += 1;
      if (this.restoreSelectionAttempts >= this.maxRestoreSelectionAttempts) {
        this.pendingSelectionSnapshot = undefined;
        this.restoreSelectionAttempts = 0;
        this.restoreSelectionTimer = undefined;
      }
    };

    if (this.restoreSelectionTimer) {
      clearTimeout(this.restoreSelectionTimer);
    }
    this.restoreSelectionTimer = setTimeout(attemptRestore, 0);
  }

  private installPageDestroyGuards(): void {
    type GuardedPageView = {
      id: number;
      destroy: () => void;
      __vpdfDestroyWrapped?: boolean;
    };

    const viewer = this.pdfViewer as { _pages?: GuardedPageView[] } | undefined;
    if (!viewer?._pages) return;

    for (const pageView of viewer._pages) {
      if (pageView.__vpdfDestroyWrapped) continue;

      const originalDestroy = pageView.destroy.bind(pageView);
      pageView.destroy = () => {
        const scroll = this.scrollContainer;
        if (!scroll) {
          originalDestroy();
          return;
        }

        const pinnedPages = new Set(getSelectionPageNumbers(scroll));
        if (this.pointerSelecting && pinnedPages.size === 0) {
          const anchor = document.getSelection()?.anchorNode;
          const anchorPage =
            anchor instanceof Element
              ? anchor.closest(".page")?.getAttribute("data-page-number")
              : anchor?.parentElement
                  ?.closest(".page")
                  ?.getAttribute("data-page-number");
          const anchorPageNumber = anchorPage
            ? Number.parseInt(anchorPage, 10)
            : undefined;
          if (anchorPageNumber) pinnedPages.add(anchorPageNumber);
        }

        if (pinnedPages.has(pageView.id)) {
          return;
        }

        originalDestroy();
      };
      pageView.__vpdfDestroyWrapped = true;
    }
  }

  private bindSelectionPreservation(): void {
    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as Element | null)?.closest(".textLayer")) {
        this.pointerSelecting = true;
      }
    };
    const onPointerUp = () => {
      this.pointerSelecting = false;
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerUp, true);
    this.listeners.push(() => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUp, true);
    });
  }

  /** pdf.js uses element.scrollIntoView, which also scrolls the host page. */
  private containFindMatchScroll(): void {
    const findController = this.findController as {
      _scrollMatches?: boolean;
      _selected?: { pageIdx: number; matchIdx: number };
      scrollMatchIntoView?: (opts: {
        element?: HTMLElement;
        pageIndex?: number;
        matchIndex?: number;
      }) => void;
    };
    findController.scrollMatchIntoView = (opts) => {
      if (!findController._scrollMatches || !opts.element) return;
      if (
        opts.matchIndex === -1 ||
        opts.matchIndex !== findController._selected?.matchIdx
      ) {
        return;
      }
      if (
        opts.pageIndex === -1 ||
        opts.pageIndex !== findController._selected?.pageIdx
      ) {
        return;
      }
      findController._scrollMatches = false;
      this.scrollElementWithinViewer(opts.element);
    };
  }

  private scrollElementWithinViewer(element: HTMLElement): void {
    const scroll = this.scrollContainer;
    if (!scroll) return;
    const elRect = element.getBoundingClientRect();
    const scRect = scroll.getBoundingClientRect();
    const top = applyDestinationScrollOffset(
      elRect.top - scRect.top + scroll.scrollTop,
      resolveDestinationOffset(
        this.getOptions().destinationOffset,
        this.pdfViewer?.currentScale,
      ),
    );
    scroll.scrollTo({
      top,
      left: Math.max(
        0,
        elRect.left -
          scRect.left +
          scroll.scrollLeft -
          (scRect.width - elRect.width) / 2,
      ),
    });
  }

  private bindEvents(): void {
    const bus = this.eventBus;
    if (!bus) return;

    const on = (name: string, handler: (evt: never) => void) => {
      bus.on(name, handler);
      this.listeners.push(() => bus.off(name, handler));
    };

    on("pagechanging", ((evt: { pageNumber: number }) => {
      if (this.jumpLock.page === undefined) {
        this.virtualScroll.onExternalPageChange(evt.pageNumber);
      }
      if (this.jumpLock.page !== undefined) return;
      this.announcePage(evt.pageNumber);
    }) as never);

    on("scalechanging", ((evt: { scale: number; presetValue?: string }) => {
      this.callbacks.onScaleChange(evt.scale, evt.presetValue);
      this.virtualScroll.onGeometryChange();
      if (this.pendingSelectionSnapshot) {
        this.scheduleSelectionRestore();
      }
    }) as never);

    on("pagesloaded", (() => {
      this.installPageDestroyGuards();
      this.virtualScroll.onPagesLoaded();
    }) as never);

    on("pagerendered", (() => {
      this.virtualScroll.onGeometryChange();
    }) as never);

    on("scrollmodechanged", ((evt: { mode: number }) => {
      if (evt.mode === PDFJS_PAGE_SCROLL_MODE) this.enableVirtualScroll();
      else this.virtualScroll.disable();
    }) as never);

    on("textlayerrendered", (() => {
      if (this.pendingSelectionSnapshot) {
        this.scheduleSelectionRestore();
      }
    }) as never);

    on("rotationchanging", ((evt: { pagesRotation: number }) => {
      this.callbacks.onRotationChange(evt.pagesRotation as 0 | 90 | 180 | 270);
      this.virtualScroll.onGeometryChange();
    }) as never);

    on("updatefindmatchescount", ((evt: {
      matchesCount: { current: number; total: number };
    }) => {
      this.callbacks.onSearchUpdate({
        matchCount: evt.matchesCount.total,
        currentMatch: evt.matchesCount.current,
        status: evt.matchesCount.total > 0 ? "found" : "not-found",
      });
    }) as never);

    on("updatefindcontrolstate", ((evt: {
      state: number;
      matchesCount?: { current: number; total: number };
    }) => {
      this.callbacks.onSearchUpdate(
        searchPatchFromFindControlState(evt.state, evt.matchesCount),
      );
    }) as never);

    on("annotationeditoruimanager", ((evt: {
      uiManager?: {
        delete: () => void;
        firstSelectedEditor?: { editorType?: string };
      };
    }) => {
      this.annotationEditorUiManager = evt.uiManager;
    }) as never);

    on("switchannotationeditormode", ((evt: {
      mode: number;
      editId?: string | null;
      isFromKeyboard?: boolean;
      mustEnterInEditMode?: boolean;
      editComment?: boolean;
    }) => {
      if (!this.pdfViewer) return;
      try {
        this.pdfViewer.annotationEditorMode = evt as never;
      } catch {
        // Annotation editor is not enabled yet.
      }
    }) as never);

    on("editingstateschanged", ((evt: {
      details?: {
        isEditing?: boolean;
        hasSelectedEditor?: boolean;
        hasSomethingToUndo?: boolean;
      };
    }) => {
      if (evt.details?.hasSomethingToUndo) {
        this.callbacks.onModifications(true);
      }
      const hasSelection = Boolean(evt.details?.hasSelectedEditor);
      const editorType =
        (hasSelection ? this.selectedEditorKind() : undefined) ??
        editorKindFromMode(this.currentEditorMode());
      this.setAnnotationEditorUi({
        isEditing: Boolean(evt.details?.isEditing),
        hasSelection,
        editorType,
        params: this.paramsForKind(editorType),
      });
      this.callbacks.onAnnotationChange({
        type: "committed",
        editorMode: this.currentEditorMode(),
        raw: evt,
      });
    }) as never);

    on("annotationeditorparamschanged", ((evt: { details?: unknown }) => {
      const editorType =
        this.selectedEditorKind() ??
        this.annotationEditorUi.editorType ??
        editorKindFromMode(this.currentEditorMode());
      this.setAnnotationEditorUi({
        ...this.annotationEditorUi,
        editorType,
        params: this.mergeEditorParams(
          editorType,
          annotationParamsFromPdfjs(evt.details),
        ),
      });
    }) as never);

    on("annotationeditormodechanged", ((evt: { mode: number }) => {
      const mode = (PDFJS_TO_EDITOR_MODE[evt.mode] ??
        "none") as VPdfAnnotationEditorMode;
      const editorType = editorKindFromMode(mode);
      this.setAnnotationEditorUi({
        ...this.annotationEditorUi,
        isEditing: mode !== "none",
        editorType,
        params: this.paramsForKind(editorType),
      });
      this.callbacks.onAnnotationChange({
        type: "updated",
        editorMode: mode,
        raw: evt,
      });
    }) as never);
  }

  private paramsForKind(
    kind: VPdfAnnotationEditorKind | undefined,
  ): VPdfAnnotationEditorParams {
    return kind ? { ...this.editorParamsByKind[kind] } : {};
  }

  private mergeEditorParams(
    kind: VPdfAnnotationEditorKind | undefined,
    patch: VPdfAnnotationEditorParams,
  ): VPdfAnnotationEditorParams {
    if (!kind) return patch;
    const next = { ...this.editorParamsByKind[kind], ...patch };
    this.editorParamsByKind[kind] = next;
    return { ...next };
  }

  private setAnnotationEditorUi(ui: VPdfAnnotationEditorUi): void {
    this.annotationEditorUi = ui;
    this.callbacks.onAnnotationEditorUi(ui);
  }

  private selectedEditorKind() {
    return asAnnotationEditorKind(
      this.annotationEditorUiManager?.firstSelectedEditor?.editorType,
    );
  }

  private currentEditorMode(): VPdfAnnotationEditorMode {
    const raw = (
      this.pdfViewer as
        | { annotationEditorMode?: number | { mode?: number } }
        | undefined
    )?.annotationEditorMode;
    const mode = typeof raw === "number" ? raw : raw?.mode;
    return (PDFJS_TO_EDITOR_MODE[mode ?? 0] ??
      "none") as VPdfAnnotationEditorMode;
  }

  private mapExternalLinkTarget(): number {
    const target =
      this.getOptions().externalLinks?.target ?? DEFAULT_EXTERNAL_LINKS.target;
    // PDF.js LinkTarget: NONE=0, SELF=1, BLANK=2, PARENT=3, TOP=4
    return target === "_self" ? 1 : 2;
  }

  private async readMeta(pdf: PDFDocumentProxy): Promise<VPdfDocumentMeta> {
    let info: Record<string, unknown> = {};
    try {
      const metadata = await pdf.getMetadata();
      info = (metadata?.info ?? {}) as Record<string, unknown>;
    } catch {
      // ignore
    }

    return {
      title: typeof info.Title === "string" ? info.Title : undefined,
      author: typeof info.Author === "string" ? info.Author : undefined,
      subject: typeof info.Subject === "string" ? info.Subject : undefined,
      keywords: typeof info.Keywords === "string" ? info.Keywords : undefined,
      creator: typeof info.Creator === "string" ? info.Creator : undefined,
      producer: typeof info.Producer === "string" ? info.Producer : undefined,
      creationDate:
        typeof info.CreationDate === "string" ? info.CreationDate : undefined,
      modificationDate:
        typeof info.ModDate === "string" ? info.ModDate : undefined,
      pageCount: pdf.numPages,
      isPureXfa: Boolean(
        (pdf as PDFDocumentProxy & { isPureXfa?: boolean }).isPureXfa,
      ),
      fingerprint: pdf.fingerprints?.[0] ?? undefined,
    };
  }

  private async readOutline(pdf: PDFDocumentProxy): Promise<VPdfOutlineItem[]> {
    try {
      const outline = await pdf.getOutline();
      if (!outline) return [];
      return outline.map(mapOutlineItem);
    } catch {
      return [];
    }
  }

  private async readAttachments(
    pdf: PDFDocumentProxy,
  ): Promise<VPdfAttachment[]> {
    try {
      const raw = await pdf.getAttachments();
      if (!raw) return [];
      return [...raw.entries()].map(([id, value]) => ({
        id,
        filename: value.filename ?? id,
        description: value.description || undefined,
        size: value.content?.byteLength,
      }));
    } catch {
      return [];
    }
  }

  /** ponytail: pdf.js lists attachments without bytes or Size; we load content for byteLength. Upgrade if FileSpec.serializable exposes size. */
  private async hydrateAttachmentSizes(
    pdf: PDFDocumentProxy,
    attachments: VPdfAttachment[],
  ): Promise<void> {
    if (attachments.every((file) => file.size != null)) return;
    const sized = await Promise.all(
      attachments.map(async (file) => {
        if (file.size != null) return file;
        try {
          const content = await pdf.getAttachmentContent(file.id);
          return { ...file, size: content?.byteLength };
        } catch {
          return file;
        }
      }),
    );
    if (this.destroyed || this.pdfDocument !== pdf) return;
    this.callbacks.onAttachments(sized);
  }

  private fail(code: string, message: string, cause?: unknown): void {
    this.callbacks.onLoadState("error");
    this.callbacks.onError({ code, message, cause });
  }
}

function mapOutlineItem(item: {
  title: string;
  bold?: boolean;
  italic?: boolean;
  color?: Uint8ClampedArray;
  dest?: string | unknown[] | null;
  url?: string | null;
  unsafeUrl?: string;
  newWindow?: boolean;
  count?: number;
  items?: unknown[];
}): VPdfOutlineItem {
  return {
    title: item.title,
    bold: item.bold,
    italic: item.italic,
    color: item.color,
    dest: item.dest ?? undefined,
    url: item.url ?? undefined,
    unsafeUrl: item.unsafeUrl,
    newWindow: item.newWindow,
    count: item.count,
    items: (item.items ?? []).map((child) => mapOutlineItem(child as never)),
  };
}

function toArrayBuffer(data: Uint8Array): ArrayBuffer {
  return data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
}
