import type { DocumentInitParameters } from "pdfjs-dist/types/src/display/api";

export type { DocumentInitParameters };

export type VPdfSource = string | File | Blob | URL | ArrayBuffer | Uint8Array;

/** Keys vpdf sets from `VPdfSource`, `load(password)`, or internal worker setup */
type VPdfReservedDocumentInitKeys = "url" | "data" | "password" | "worker";

/**
 * Class-instance PDF.js keys. Omitted from viewer `documentInit` because Vue
 * `Ref` unwrap cannot represent types with `#private` fields. Set them from
 * `onPrepareDocumentInit` if needed.
 */
type VPdfInstanceDocumentInitKeys =
  | "range"
  | "ownerDocument"
  | "CanvasFactory"
  | "FilterFactory"
  | "BinaryDataFactory"
  | "pagesMapper";

/** PDF.js `getDocument` options hosts may set on the viewer or `load()`. */
export type VPdfDocumentInitOptions = Omit<
  DocumentInitParameters,
  VPdfReservedDocumentInitKeys | VPdfInstanceDocumentInitKeys
>;

/** Draft passed to `pdfjs.getDocument()`, including flags PDF.js accepts at runtime. */
export type VPdfGetDocumentParameters = DocumentInitParameters & {
  isEvalSupported?: boolean;
  enableScripting?: boolean;
};

export interface VPdfDocumentLoadContext {
  source: VPdfSource;
  password?: string;
}

export interface VPdfPrepareDocumentInitEvent {
  /** Mutable draft passed to `pdfjs.getDocument()` */
  params: VPdfGetDocumentParameters;
  context: VPdfDocumentLoadContext;
}

export type VPdfSidebarPanel =
  | "none"
  | "thumbnails"
  | "outline"
  | "attachments"
  | "plugins";

export type VPdfAnnotationEditorMode =
  | "none"
  | "freetext"
  | "highlight"
  | "ink"
  | "stamp";

export type VPdfAnnotationEditorKind = Exclude<
  VPdfAnnotationEditorMode,
  "none"
>;

export interface VPdfAnnotationEditorParams {
  color?: string;
  fontSize?: number;
  thickness?: number;
  opacity?: number;
}

export interface VPdfAnnotationEditorUi {
  isEditing: boolean;
  hasSelection: boolean;
  editorType?: VPdfAnnotationEditorKind;
  params: VPdfAnnotationEditorParams;
}

export interface VPdfAnnotationEditorActions {
  update(patch: VPdfAnnotationEditorParams): void;
  deleteSelected(): void;
}

export interface VPdfAnnotationEditorProps {
  editorType?: VPdfAnnotationEditorKind;
  params: VPdfAnnotationEditorParams;
  canDelete: boolean;
  actions: VPdfAnnotationEditorActions;
}

export type VPdfLoadState =
  | "idle"
  | "loading"
  | "password"
  | "ready"
  | "error"
  | "unsupported";

export type VPdfPasswordReason = "need" | "incorrect";

export interface VPdfToolbarFeatures {
  download?: boolean;
  search?: boolean;
  zoom?: boolean;
  rotate?: boolean;
  pageNav?: boolean;
  sidebar?: boolean;
  annotations?: boolean;
  documentProperties?: boolean;
}

export interface VPdfFeatureFlags {
  textLayer?: boolean;
  annotationLayer?: boolean;
  xfa?: boolean;
  search?: boolean;
  thumbnails?: boolean;
  outline?: boolean;
  attachments?: boolean;
  annotations?: boolean;
  scripting?: boolean;
}

export interface VPdfExternalLinkOptions {
  enabled?: boolean;
  target?: "_blank" | "_self";
  rel?: string;
}

export interface VPdfAssetUrls {
  /** URL to pdf.worker.min.mjs matching the installed pdfjs-dist version */
  workerSrc?: string;
  /** Base URL for CMap files (trailing slash optional) */
  cMapUrl?: string;
  /** Base URL for standard fonts */
  standardFontDataUrl?: string;
  /** Base URL for WASM assets when present */
  wasmUrl?: string;
  /** Base URL for annotation/editor images */
  imageResourcesPath?: string;
}

export interface VPdfViewerOptions {
  src?: VPdfSource;
  password?: string;
  scale?:
    | number
    | "page-width"
    | "page-height"
    | "page-fit"
    | "page-actual"
    | "auto";
  rotation?: 0 | 90 | 180 | 270;
  locale?: string;
  features?: VPdfFeatureFlags;
  toolbar?: VPdfToolbarFeatures | false;
  sidebar?: VPdfSidebarPanel;
  assets?: VPdfAssetUrls;
  externalLinks?: VPdfExternalLinkOptions;
  /** When false, attachment downloads require host confirmation via `attachmentDownload` / `onAttachmentDownload`. Default true. */
  allowAttachmentDownload?: boolean;
  /** Initial annotation editor mode (PDF.js-native modes only) */
  annotationEditorMode?: VPdfAnnotationEditorMode;
  /** Smooth-scroll the viewer when jumping via prev/next, page input, keyboard, or sidebar */
  smoothJump?: boolean;
  /** Space between pages in px at 100% scale. Default 10. */
  pageGap?: number;
  /** Page corner radius in px at 100% scale. Default 10. 0 = square (no radius/border/shadow). */
  pageRadius?: number;
  /** Top inset in px at 100% scale when scrolling to a destination (outline, in-doc links, search matches). Default 20. 0 = no inset. */
  destinationOffset?: number;
  /** Thumbnail grid columns in the Pages sidebar. Integer >= 1. Default 2. */
  thumbnailColumns?: number;
  /**
   * Extra PDF.js `getDocument` options (`httpHeaders`, `withCredentials`, range
   * flags, etc.). `url` / `data` / `password` / `worker` are reserved.
   */
  documentInit?: VPdfDocumentInitOptions;
  class?: string;
}

export interface VPdfOutlineItem {
  title: string;
  bold?: boolean;
  italic?: boolean;
  color?: Uint8ClampedArray;
  dest?: string | unknown[] | undefined;
  url?: string | undefined;
  unsafeUrl?: string | undefined;
  newWindow?: boolean;
  count?: number;
  items: VPdfOutlineItem[];
}

export interface VPdfAttachment {
  id: string;
  filename: string;
  contentType?: string;
  description?: string;
  size?: number;
}

export interface VPdfAttachmentDownloadEvent {
  attachment: VPdfAttachment;
  download: () => Promise<void>;
}

export interface VPdfSearchState {
  query: string;
  matchCount: number;
  currentMatch: number;
  caseSensitive: boolean;
  entireWord: boolean;
  highlightAll: boolean;
  matchDiacritics: boolean;
  findPrevious: boolean;
  status: "idle" | "pending" | "found" | "not-found" | "wrapped";
}

export interface VPdfPasswordRequest {
  reason: VPdfPasswordReason;
  submit: (password: string) => void;
  cancel: () => void;
}

export interface VPdfProgressEvent {
  loaded: number;
  total: number;
}

export interface VPdfErrorEvent {
  code: string;
  message: string;
  cause?: unknown;
}

export interface VPdfPageChangeEvent {
  pageNumber: number;
  pageCount: number;
}

export interface VPdfScaleChangeEvent {
  scale: number;
  preset?: string;
}

export interface VPdfAnnotationChangeEvent {
  type: "added" | "updated" | "removed" | "committed";
  editorMode: VPdfAnnotationEditorMode;
  pageNumber?: number;
  raw?: unknown;
}

export interface VPdfDocumentMeta {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  pageCount: number;
  isPureXfa: boolean;
  fingerprint?: string;
}

export interface VPdfViewerState {
  loadState: VPdfLoadState;
  pageNumber: number;
  pageCount: number;
  scale: number;
  /** Active PDF.js fit preset when zoom is not a numeric value */
  scalePreset?: string;
  rotation: 0 | 90 | 180 | 270;
  sidebar: VPdfSidebarPanel;
  annotationEditorMode: VPdfAnnotationEditorMode;
  annotationEditor: VPdfAnnotationEditorUi;
  search: VPdfSearchState;
  progress: VPdfProgressEvent;
  error?: VPdfErrorEvent;
  password?: VPdfPasswordRequest;
  outline: VPdfOutlineItem[];
  attachments: VPdfAttachment[];
  meta?: VPdfDocumentMeta;
  hasModifications: boolean;
}

export type VPdfFindEventType =
  | ""
  | "again"
  | "highlightallchange"
  | "casesensitivitychange"
  | "entirewordchange"
  | "diacriticmatchingchange";

export interface VPdfFindOptions {
  query: string;
  caseSensitive?: boolean;
  entireWord?: boolean;
  highlightAll?: boolean;
  matchDiacritics?: boolean;
  findPrevious?: boolean;
  type?: VPdfFindEventType;
}

export interface VPdfPageGeometry {
  pageNumber: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
  /** Viewport transform matrix from PDF.js */
  transform: number[];
}

export interface VPdfViewerController {
  load(
    source: VPdfSource,
    password?: string,
    documentInit?: VPdfDocumentInitOptions,
  ): Promise<void>;
  close(): Promise<void>;
  goToPage(pageNumber: number): void;
  nextPage(): void;
  previousPage(): void;
  goToDestination(dest: string | unknown[]): Promise<void>;
  setScale(scale: number | string): void;
  zoomIn(step?: number): void;
  zoomOut(step?: number): void;
  rotate(delta?: 90 | -90): void;
  setSidebar(panel: VPdfSidebarPanel): void;
  setAnnotationEditorMode(mode: VPdfAnnotationEditorMode): void;
  updateAnnotationEditor(patch: VPdfAnnotationEditorParams): void;
  deleteSelectedAnnotation(): void;
  find(options: VPdfFindOptions): void;
  findNext(): void;
  findPrevious(): void;
  clearFind(): void;
  downloadOriginal(filename?: string): Promise<void>;
  saveModified(filename?: string): Promise<Uint8Array>;
  getDocument(): import("pdfjs-dist").PDFDocumentProxy | undefined;
  getPage(
    pageNumber: number,
  ): Promise<import("pdfjs-dist").PDFPageProxy | undefined>;
  getPageGeometry(pageNumber: number): VPdfPageGeometry | undefined;
  getState(): Readonly<VPdfViewerState>;
  /**
   * Experimental escape hatch — not part of the stable public API.
   * May change between minor versions.
   */
  getExperimentalViewer(): unknown;
}
