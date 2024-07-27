import type { PageViewport } from "pdfjs-dist";
import type {
  OnProgressParameters,
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  DocumentInitParameters,
  TypedArray,
  RenderParameters,
} from "pdfjs-dist/types/src/display/api";

type Size = {
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

type Bounds = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type ScrollState = {
  right: boolean;
  down: boolean;
  lastX: number;
  lastY: number;
};

// ----------------------------- PDF Loader ----------------------------- //
type pdfSource =
  | string
  | URL
  | TypedArray
  | ArrayBuffer
  | DocumentInitParameters;

interface pdfOptions {
  workerSrc?: string;
  password?: string;
  onError?: (error: any) => void;
  onProgress?: (data: OnProgressParameters) => void;
  onPassword?: (callback: Function, reason: any) => void;
}

type pdfOutlineDest = string | Array<any> | null;

type pdfOutline = Awaited<ReturnType<PDFDocumentProxy["getOutline"]>>;

type pdfOutlinePairs = {
  page: number | null;
  offsetY: number;
  offsetX: number;
  title: string;
  sub: Array<pdfOutlinePairs>;
};

// ----------------------------- PDF Viewer ----------------------------- //
type pdfViewerOptions = {
  pdf: PDFDocumentLoadingTask | undefined;
  page: number;
  scale: number;
  gap: number;
  rotation: number;
  view: "vertical" | "horizontal";
  textLayer: boolean;
  smoothJump: boolean;
  renderDelay: number;
  downScale?: number;
};

type pdfPageInfo = {
  id: string;
  scale: number;
  rotation: number;
  page: number;
  viewport: PageViewport;
  v1: PageViewport;
  pos: Point;
  bounds: pdfPageBounds;
};

type pdfPageBounds = {
  inner: Bounds;
  outer: Bounds;
};

type pdfScrollState = {
  rAF: number | null;
  state: ScrollState;
  covered: Point;
  timer: ReturnType<typeof setTimeout> | null;
};

type pdfattachmentFile = {
  filename: string;
  content: TypedArray;
  rawFilename: string;
};

type pdfattachment = Record<string, pdfattachmentFile>;

export {
  Size,
  Point,
  Bounds,
  ScrollState,
  pdfSource,
  pdfOptions,
  pdfOutlineDest,
  pdfOutline,
  pdfOutlinePairs,
  pdfViewerOptions,
  pdfPageInfo,
  pdfPageBounds,
  pdfScrollState,
  pdfattachmentFile,
  pdfattachment,
  RenderParameters,
};
