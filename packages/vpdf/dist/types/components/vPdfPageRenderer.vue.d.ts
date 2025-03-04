import { type PDFDocumentLoadingTask, type PDFDocumentProxy, type PageViewport } from "pdfjs-dist";
import type { pdfPageInfo } from "../types/pdf";
type RenderArgs = {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    viewport: PageViewport;
    doc: PDFDocumentProxy;
};
interface IProps {
    pageInfo: pdfPageInfo;
    pdf: PDFDocumentLoadingTask;
    textLayer: boolean;
    render: boolean;
    onRender?: (opts: RenderArgs) => void;
    onError?: Function;
}
declare function __VLS_template(): {
    prepend?(_: {}): any;
    append?(_: {}): any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<IProps>, {
    textLayer: boolean;
    render: boolean;
    onRender: () => void;
}>, {
    context: import("vue").ComputedRef<CanvasRenderingContext2D | null | undefined>;
    canvas: import("vue").Ref<HTMLCanvasElement | undefined>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<IProps>, {
    textLayer: boolean;
    render: boolean;
    onRender: () => void;
}>>>, {
    textLayer: boolean;
    render: boolean;
    onRender: (opts: RenderArgs) => void;
}, {}>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, ReturnType<typeof __VLS_template>>;
export default _default;
type __VLS_WithDefaults<P, D> = {
    [K in keyof Pick<P, keyof P>]: K extends keyof D ? __VLS_Prettify<P[K] & {
        default: D[K];
    }> : P[K];
};
type __VLS_Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
type __VLS_TypePropsToOption<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? {
        type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
    } : {
        type: import('vue').PropType<T[K]>;
        required: true;
    };
};
