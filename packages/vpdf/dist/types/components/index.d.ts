declare const _default: {
    VPdf: import("vue").DefineComponent<{
        password: {
            type: import("vue").PropType<string>;
        };
        onPassword: {
            type: import("vue").PropType<(callback: Function, reason: number) => {}>;
        };
        textLayer: {
            type: import("vue").PropType<boolean>;
            default: boolean;
        };
        smoothJump: {
            type: import("vue").PropType<boolean>;
            default: boolean;
        };
        src: {
            type: import("vue").PropType<import("../index.js").pdfSource>;
            required: true;
        };
        workerSrc: {
            type: import("vue").PropType<string>;
        };
    }, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        password: {
            type: import("vue").PropType<string>;
        };
        onPassword: {
            type: import("vue").PropType<(callback: Function, reason: number) => {}>;
        };
        textLayer: {
            type: import("vue").PropType<boolean>;
            default: boolean;
        };
        smoothJump: {
            type: import("vue").PropType<boolean>;
            default: boolean;
        };
        src: {
            type: import("vue").PropType<import("../index.js").pdfSource>;
            required: true;
        };
        workerSrc: {
            type: import("vue").PropType<string>;
        };
    }>>, {
        textLayer: boolean;
        smoothJump: boolean;
    }, {}>;
    VPdfPageRenderer: {
        new (...args: any[]): import("vue").CreateComponentPublicInstance<Readonly<import("vue").ExtractPropTypes<{
            pdf: {
                type: import("vue").PropType<import("pdfjs-dist/types/src/display/api.js").PDFDocumentLoadingTask>;
                required: true;
            };
            textLayer: {
                type: import("vue").PropType<boolean>;
                required: true;
                default: boolean;
            };
            pageInfo: {
                type: import("vue").PropType<import("../index.js").pdfPageInfo>;
                required: true;
            };
            onError: {
                type: import("vue").PropType<Function>;
            };
            render: {
                type: import("vue").PropType<boolean>;
                required: true;
                default: boolean;
            };
            onRender: {
                type: import("vue").PropType<(opts: {
                    canvas: HTMLCanvasElement;
                    context: CanvasRenderingContext2D;
                    viewport: import("pdfjs-dist").PageViewport;
                    doc: import("pdfjs-dist").PDFDocumentProxy;
                }) => void>;
                default: () => void;
            };
        }>>, {
            context: import("vue").ComputedRef<CanvasRenderingContext2D | null | undefined>;
            canvas: import("vue").Ref<HTMLCanvasElement | undefined>;
        }, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & Readonly<import("vue").ExtractPropTypes<{
            pdf: {
                type: import("vue").PropType<import("pdfjs-dist/types/src/display/api.js").PDFDocumentLoadingTask>;
                required: true;
            };
            textLayer: {
                type: import("vue").PropType<boolean>;
                required: true;
                default: boolean;
            };
            pageInfo: {
                type: import("vue").PropType<import("../index.js").pdfPageInfo>;
                required: true;
            };
            onError: {
                type: import("vue").PropType<Function>;
            };
            render: {
                type: import("vue").PropType<boolean>;
                required: true;
                default: boolean;
            };
            onRender: {
                type: import("vue").PropType<(opts: {
                    canvas: HTMLCanvasElement;
                    context: CanvasRenderingContext2D;
                    viewport: import("pdfjs-dist").PageViewport;
                    doc: import("pdfjs-dist").PDFDocumentProxy;
                }) => void>;
                default: () => void;
            };
        }>>, {
            textLayer: boolean;
            render: boolean;
            onRender: (opts: {
                canvas: HTMLCanvasElement;
                context: CanvasRenderingContext2D;
                viewport: import("pdfjs-dist").PageViewport;
                doc: import("pdfjs-dist").PDFDocumentProxy;
            }) => void;
        }, true, {}, {}, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("vue").ExtractPropTypes<{
            pdf: {
                type: import("vue").PropType<import("pdfjs-dist/types/src/display/api.js").PDFDocumentLoadingTask>;
                required: true;
            };
            textLayer: {
                type: import("vue").PropType<boolean>;
                required: true;
                default: boolean;
            };
            pageInfo: {
                type: import("vue").PropType<import("../index.js").pdfPageInfo>;
                required: true;
            };
            onError: {
                type: import("vue").PropType<Function>;
            };
            render: {
                type: import("vue").PropType<boolean>;
                required: true;
                default: boolean;
            };
            onRender: {
                type: import("vue").PropType<(opts: {
                    canvas: HTMLCanvasElement;
                    context: CanvasRenderingContext2D;
                    viewport: import("pdfjs-dist").PageViewport;
                    doc: import("pdfjs-dist").PDFDocumentProxy;
                }) => void>;
                default: () => void;
            };
        }>>, {
            context: import("vue").ComputedRef<CanvasRenderingContext2D | null | undefined>;
            canvas: import("vue").Ref<HTMLCanvasElement | undefined>;
        }, {}, {}, {}, {
            textLayer: boolean;
            render: boolean;
            onRender: (opts: {
                canvas: HTMLCanvasElement;
                context: CanvasRenderingContext2D;
                viewport: import("pdfjs-dist").PageViewport;
                doc: import("pdfjs-dist").PDFDocumentProxy;
            }) => void;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("vue").ExtractPropTypes<{
        pdf: {
            type: import("vue").PropType<import("pdfjs-dist/types/src/display/api.js").PDFDocumentLoadingTask>;
            required: true;
        };
        textLayer: {
            type: import("vue").PropType<boolean>;
            required: true;
            default: boolean;
        };
        pageInfo: {
            type: import("vue").PropType<import("../index.js").pdfPageInfo>;
            required: true;
        };
        onError: {
            type: import("vue").PropType<Function>;
        };
        render: {
            type: import("vue").PropType<boolean>;
            required: true;
            default: boolean;
        };
        onRender: {
            type: import("vue").PropType<(opts: {
                canvas: HTMLCanvasElement;
                context: CanvasRenderingContext2D;
                viewport: import("pdfjs-dist").PageViewport;
                doc: import("pdfjs-dist").PDFDocumentProxy;
            }) => void>;
            default: () => void;
        };
    }>>, {
        context: import("vue").ComputedRef<CanvasRenderingContext2D | null | undefined>;
        canvas: import("vue").Ref<HTMLCanvasElement | undefined>;
    }, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        textLayer: boolean;
        render: boolean;
        onRender: (opts: {
            canvas: HTMLCanvasElement;
            context: CanvasRenderingContext2D;
            viewport: import("pdfjs-dist").PageViewport;
            doc: import("pdfjs-dist").PDFDocumentProxy;
        }) => void;
    }, {}, string, {}> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            prepend?(_: {}): any;
            append?(_: {}): any;
        };
    });
    VPdfViewer: {
        new (...args: any[]): import("vue").CreateComponentPublicInstance<Readonly<import("vue").ExtractPropTypes<{
            pdf: {
                type: import("vue").PropType<import("pdfjs-dist").PDFDocumentLoadingTask>;
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
                type: import("vue").PropType<"vertical" | "horizontal">;
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
            numPages: import("vue").Ref<number>;
            progress: import("vue").Ref<import("pdfjs-dist/types/src/display/api.js").OnProgressParameters | undefined>;
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
                    clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils.js").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils.js").PageViewport;
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
                    clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils.js").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils.js").PageViewport;
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
            changePage: (page: number, offset?: import("../index.js").Point | null) => void;
            nextPage: () => void;
            prevPage: () => void;
            fitWidth: () => number;
            fitHeight: () => number;
            fitPage: (mode?: "width" | "height" | "fit") => number;
        }, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            progress: (...args: any[]) => void;
            "update:page": (...args: any[]) => void;
            "update:scale": (...args: any[]) => void;
        }, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & Readonly<import("vue").ExtractPropTypes<{
            pdf: {
                type: import("vue").PropType<import("pdfjs-dist").PDFDocumentLoadingTask>;
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
                type: import("vue").PropType<"vertical" | "horizontal">;
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
        }, true, {}, {}, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("vue").ExtractPropTypes<{
            pdf: {
                type: import("vue").PropType<import("pdfjs-dist").PDFDocumentLoadingTask>;
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
                type: import("vue").PropType<"vertical" | "horizontal">;
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
            numPages: import("vue").Ref<number>;
            progress: import("vue").Ref<import("pdfjs-dist/types/src/display/api.js").OnProgressParameters | undefined>;
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
                    clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils.js").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils.js").PageViewport;
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
                    clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils.js").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils.js").PageViewport;
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
            changePage: (page: number, offset?: import("../index.js").Point | null) => void;
            nextPage: () => void;
            prevPage: () => void;
            fitWidth: () => number;
            fitHeight: () => number;
            fitPage: (mode?: "width" | "height" | "fit") => number;
        }, {}, {}, {}, {
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
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("vue").ExtractPropTypes<{
        pdf: {
            type: import("vue").PropType<import("pdfjs-dist").PDFDocumentLoadingTask>;
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
            type: import("vue").PropType<"vertical" | "horizontal">;
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
        numPages: import("vue").Ref<number>;
        progress: import("vue").Ref<import("pdfjs-dist/types/src/display/api.js").OnProgressParameters | undefined>;
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
                clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils.js").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils.js").PageViewport;
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
                clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils.js").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils.js").PageViewport;
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
        changePage: (page: number, offset?: import("../index.js").Point | null) => void;
        nextPage: () => void;
        prevPage: () => void;
        fitWidth: () => number;
        fitHeight: () => number;
        fitPage: (mode?: "width" | "height" | "fit") => number;
    }, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        progress: (...args: any[]) => void;
        "update:page": (...args: any[]) => void;
        "update:scale": (...args: any[]) => void;
    }, string, {
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
    }, {}, string, {}> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            prepend?(_: {
                numPages: import("vue").Ref<number>;
                progress: import("vue").Ref<import("pdfjs-dist/types/src/display/api.js").OnProgressParameters | undefined>;
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
                        clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils.js").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils.js").PageViewport;
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
                        clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils.js").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils.js").PageViewport;
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
                changePage: (page: number, offset?: import("../index.js").Point | null) => void;
                nextPage: () => void;
                prevPage: () => void;
                fitWidth: () => number;
                fitHeight: () => number;
                fitPage: (mode?: "width" | "height" | "fit") => number;
            }): any;
            default?(_: {
                numPages: import("vue").Ref<number>;
                progress: import("vue").Ref<import("pdfjs-dist/types/src/display/api.js").OnProgressParameters | undefined>;
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
                        clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils.js").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils.js").PageViewport;
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
                        clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils.js").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils.js").PageViewport;
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
                changePage: (page: number, offset?: import("../index.js").Point | null) => void;
                nextPage: () => void;
                prevPage: () => void;
                fitWidth: () => number;
                fitHeight: () => number;
                fitPage: (mode?: "width" | "height" | "fit") => number;
            }): any;
            renderer?(_: {
                pdf: import("pdfjs-dist/types/src/display/api.js").PDFDocumentLoadingTask;
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
                        clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils.js").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils.js").PageViewport;
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
                progress: import("vue").Ref<import("pdfjs-dist/types/src/display/api.js").OnProgressParameters | undefined>;
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
                        clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils.js").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils.js").PageViewport;
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
                        clone: ({ scale, rotation, offsetX, offsetY, dontFlip, }?: import("pdfjs-dist/types/src/display/display_utils.js").PageViewportCloneParameters | undefined) => import("pdfjs-dist/types/src/display/display_utils.js").PageViewport;
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
                changePage: (page: number, offset?: import("../index.js").Point | null) => void;
                nextPage: () => void;
                prevPage: () => void;
                fitWidth: () => number;
                fitHeight: () => number;
                fitPage: (mode?: "width" | "height" | "fit") => number;
            }): any;
        };
    });
};
export default _default;
