import { Ref } from "vue";
import type { PageViewport } from "pdfjs-dist";
import type { OnProgressParameters, PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import type { Bounds, Point, ScrollState, pdfPageBounds, pdfPageInfo, pdfViewerOptions } from "../types/pdf";
export declare function usePdfViewer(container: Ref<HTMLElement | undefined>, options: pdfViewerOptions): {
    totalPage: Ref<number>;
    pageInfo: Ref<{
        id: string;
        scale: number;
        rotation: number;
        page: number;
        viewport: {
            viewBox: number[];
            scale: number;
            rotation: number;
            offsetX: number;
            offsetY: number;
            transform: number[];
            width: number;
            height: number;
            readonly rawDims: Object;
            clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils").PageViewport;
            convertToViewportPoint: (x: number, y: number) => any[];
            convertToViewportRectangle: (rect: any[]) => any[];
            convertToPdfPoint: (x: number, y: number) => any[];
        };
        pos: {
            x: number;
            y: number;
        };
        bounds: {
            inner: {
                top: number;
                bottom: number;
                left: number;
                right: number;
            };
            outer: {
                top: number;
                bottom: number;
                left: number;
                right: number;
            };
        };
    }[]>;
    containerBounds: Ref<{
        width: number;
        height: number;
    }>;
    scrollState: Ref<{
        rAF: number | null;
        state: {
            right: boolean;
            down: boolean;
            lastX: number;
            lastY: number;
        };
        covered: {
            x: number;
            y: number;
        };
        timer: {
            ref: () => NodeJS.Timeout;
            unref: () => NodeJS.Timeout;
            hasRef: () => boolean;
            refresh: () => NodeJS.Timeout;
            [Symbol.toPrimitive]: () => number;
            [Symbol.dispose]: () => void;
        } | null;
    }>;
    progress: Ref<OnProgressParameters | undefined>;
    render: Ref<boolean>;
    currentPage: Ref<number>;
    visiblePages: Ref<{
        id: string;
        scale: number;
        rotation: number;
        page: number;
        viewport: {
            viewBox: number[];
            scale: number;
            rotation: number;
            offsetX: number;
            offsetY: number;
            transform: number[];
            width: number;
            height: number;
            readonly rawDims: Object;
            clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils").PageViewport;
            convertToViewportPoint: (x: number, y: number) => any[];
            convertToViewportRectangle: (rect: any[]) => any[];
            convertToPdfPoint: (x: number, y: number) => any[];
        };
        pos: {
            x: number;
            y: number;
        };
        bounds: {
            inner: {
                top: number;
                bottom: number;
                left: number;
                right: number;
            };
            outer: {
                top: number;
                bottom: number;
                left: number;
                right: number;
            };
        };
    }[]>;
    scale: import("vue").ComputedRef<number>;
    rotation: import("vue").ComputedRef<number>;
    viewMode: import("vue").ComputedRef<string>;
    readPDF: () => Promise<void>;
    refresh: () => Promise<void>;
    getPageInfo: (pdf: PDFDocumentProxy, docId: string, numPages: number) => Promise<void>;
    getBounds: (pageInfo: pdfPageInfo, vertical?: boolean) => pdfPageBounds;
    getVBounds: (inner: Bounds, gap: number, firstHG: number, lastHG: number) => pdfPageBounds;
    getHBounds: (inner: Bounds, gap: number, firstHG: number, lastHG: number) => pdfPageBounds;
    getInnerBounds: (pos: Point, viewport: PageViewport) => Bounds;
    getGaps: () => {
        gap: number;
        hGap: number;
        dGap: number;
    };
    getVisiblePages: (sState: ScrollState, container: HTMLElement) => Array<pdfPageInfo>;
    boundsIntersecting: (bounds1: Bounds, bounds2: Bounds) => boolean;
    onContainerScroll: (e: Event) => void;
    inRange: (x: number, min: number, max: number) => boolean;
    getCurrentPage: (sState: ScrollState, target: HTMLElement) => number;
    nextPage: () => void;
    prevPage: () => void;
    changePage: (page: number, offset?: Point | null) => void;
    fitWidth: () => number;
    fitHeight: () => number;
    fitPage: (mode?: "width" | "height" | "fit") => number;
};
