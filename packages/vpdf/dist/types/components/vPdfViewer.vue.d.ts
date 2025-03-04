import type { PDFDocumentLoadingTask } from "pdfjs-dist";
import { PropType } from "vue";
declare function __VLS_template(): {
    prepend?(_: {
        numPages: import("vue").Ref<number>;
        progress: import("vue").Ref<import("pdfjs-dist/types/src/display/api").OnProgressParameters | undefined>;
        pages: import("vue").Ref<{
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
        container: import("vue").Ref<{
            width: number;
            height: number;
        }>;
        currentPage: import("vue").Ref<number>;
        visiblePages: import("vue").Ref<{
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
        render: import("vue").Ref<boolean>;
        viewMode: import("vue").ComputedRef<string>;
        changePage: (page: number, offset?: import("..").Point | null) => void;
        nextPage: () => void;
        prevPage: () => void;
        fitWidth: () => number;
        fitHeight: () => number;
        fitPage: (mode?: "width" | "height" | "fit") => number;
    }): any;
    default?(_: {
        numPages: import("vue").Ref<number>;
        progress: import("vue").Ref<import("pdfjs-dist/types/src/display/api").OnProgressParameters | undefined>;
        pages: import("vue").Ref<{
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
        container: import("vue").Ref<{
            width: number;
            height: number;
        }>;
        currentPage: import("vue").Ref<number>;
        visiblePages: import("vue").Ref<{
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
        render: import("vue").Ref<boolean>;
        viewMode: import("vue").ComputedRef<string>;
        changePage: (page: number, offset?: import("..").Point | null) => void;
        nextPage: () => void;
        prevPage: () => void;
        fitWidth: () => number;
        fitHeight: () => number;
        fitPage: (mode?: "width" | "height" | "fit") => number;
    }): any;
    renderer?(_: {
        pdf: import("pdfjs-dist/types/src/display/api").PDFDocumentLoadingTask;
        pageInfo: {
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
        };
        render: boolean;
    }): any;
    append?(_: {
        numPages: import("vue").Ref<number>;
        progress: import("vue").Ref<import("pdfjs-dist/types/src/display/api").OnProgressParameters | undefined>;
        pages: import("vue").Ref<{
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
        container: import("vue").Ref<{
            width: number;
            height: number;
        }>;
        currentPage: import("vue").Ref<number>;
        visiblePages: import("vue").Ref<{
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
        render: import("vue").Ref<boolean>;
        viewMode: import("vue").ComputedRef<string>;
        changePage: (page: number, offset?: import("..").Point | null) => void;
        nextPage: () => void;
        prevPage: () => void;
        fitWidth: () => number;
        fitHeight: () => number;
        fitPage: (mode?: "width" | "height" | "fit") => number;
    }): any;
};
declare const __VLS_component: import("vue").DefineComponent<{
    pdf: {
        type: PropType<PDFDocumentLoadingTask>;
        required: true;
    };
    scale: {
        type: NumberConstructor;
        default: number;
    };
    gap: {
        type: NumberConstructor;
        default: number;
    };
    rotation: {
        type: NumberConstructor;
        default: number;
        validator: (val: number) => true;
    };
    view: {
        type: PropType<"vertical" | "horizontal">;
        default: string;
    };
    page: {
        type: NumberConstructor;
        default: number;
    };
    textLayer: {
        type: BooleanConstructor;
        default: boolean;
    };
    smoothJump: {
        type: BooleanConstructor;
        default: boolean;
    };
    renderDelay: {
        type: NumberConstructor;
        default: number;
    };
    renderOffset: {
        type: NumberConstructor;
        default: number;
    };
    onProgress: {
        type: FunctionConstructor;
        default: () => void;
    };
}, {
    numPages: import("vue").Ref<number>;
    progress: import("vue").Ref<import("pdfjs-dist/types/src/display/api").OnProgressParameters | undefined>;
    pages: import("vue").Ref<{
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
    container: import("vue").Ref<{
        width: number;
        height: number;
    }>;
    currentPage: import("vue").Ref<number>;
    visiblePages: import("vue").Ref<{
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
    render: import("vue").Ref<boolean>;
    viewMode: import("vue").ComputedRef<string>;
    changePage: (page: number, offset?: import("..").Point | null) => void;
    nextPage: () => void;
    prevPage: () => void;
    fitWidth: () => number;
    fitHeight: () => number;
    fitPage: (mode?: "width" | "height" | "fit") => number;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    progress: (...args: any[]) => void;
    "update:page": (...args: any[]) => void;
    "update:scale": (...args: any[]) => void;
}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    pdf: {
        type: PropType<PDFDocumentLoadingTask>;
        required: true;
    };
    scale: {
        type: NumberConstructor;
        default: number;
    };
    gap: {
        type: NumberConstructor;
        default: number;
    };
    rotation: {
        type: NumberConstructor;
        default: number;
        validator: (val: number) => true;
    };
    view: {
        type: PropType<"vertical" | "horizontal">;
        default: string;
    };
    page: {
        type: NumberConstructor;
        default: number;
    };
    textLayer: {
        type: BooleanConstructor;
        default: boolean;
    };
    smoothJump: {
        type: BooleanConstructor;
        default: boolean;
    };
    renderDelay: {
        type: NumberConstructor;
        default: number;
    };
    renderOffset: {
        type: NumberConstructor;
        default: number;
    };
    onProgress: {
        type: FunctionConstructor;
        default: () => void;
    };
}>> & {
    onProgress?: ((...args: any[]) => any) | undefined;
    "onUpdate:page"?: ((...args: any[]) => any) | undefined;
    "onUpdate:scale"?: ((...args: any[]) => any) | undefined;
}, {
    onProgress: Function;
    page: number;
    scale: number;
    gap: number;
    rotation: number;
    view: "vertical" | "horizontal";
    textLayer: boolean;
    smoothJump: boolean;
    renderDelay: number;
    renderOffset: number;
}, {}>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, ReturnType<typeof __VLS_template>>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
