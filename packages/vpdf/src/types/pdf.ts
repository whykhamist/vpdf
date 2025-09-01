import type { PageViewport } from "pdfjs-dist";
import type {
  OnProgressParameters,
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  DocumentInitParameters,
  TypedArray,
} from "pdfjs-dist/types/src/display/api";

export type Size = {
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

export type Bounds = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type ScrollState = {
  right: boolean;
  down: boolean;
  lastX: number;
  lastY: number;
};

// ----------------------------- PDF Loader ----------------------------- //
export type pdfSource =
  | string
  | URL
  | TypedArray
  | ArrayBuffer
  | DocumentInitParameters;

export interface pdfOptions {
  workerSrc?: string;
  password?: string;
  onError?: (error: any) => void;
  onProgress?: (data: OnProgressParameters) => void;
  onPassword?: (callback: Function, reason: any) => void;
}

export type pdfOutlineDest = string | Array<any> | null;

export type pdfOutline = Awaited<ReturnType<PDFDocumentProxy["getOutline"]>>;

export type pdfOutlinePairs = {
  page: number | null;
  offsetY: number;
  offsetX: number;
  title: string;
  sub: Array<pdfOutlinePairs>;
};

// ----------------------------- PDF Viewer ----------------------------- //
export type pdfViewerOptions = {
  pdf: PDFDocumentLoadingTask;
  page: number;
  scale: number;
  gap: number;
  rotation: number;
  view: "vertical" | "horizontal";
  textLayer: boolean;
  smoothJump: boolean;
  renderDelay: number;
  renderOffset: number;
  downScale?: number;
};

export type pdfPageInfo = {
  id: string;
  scale: number;
  rotation: number;
  page: number;
  viewport: PageViewport;
  pos: Point;
  bounds: pdfPageBounds;
};

export type pdfPageBounds = {
  inner: Bounds;
  outer: Bounds;
};

export type pdfScrollState = {
  rAF: number | null;
  state: ScrollState;
  covered: Point;
  timer: ReturnType<typeof setTimeout> | null;
};

export type pdfattachmentFile = {
  filename: string;
  content: TypedArray;
  rawFilename: string;
};

export type pdfattachment = Record<string, pdfattachmentFile>;

export type Position = "top" | "bottom" | "left" | "right";

export type FitPageMode = "fit" | "width" | "height";
