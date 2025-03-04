import { pdfattachment, pdfOutlinePairs } from "../../types/pdf";
import type { PDFDocumentLoadingTask } from "pdfjs-dist/types/src/display/api";
declare const _default: import("vue").DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<{
    modelValue: boolean;
    options: Record<string, Object>;
    outline?: Array<pdfOutlinePairs>;
    attachments?: pdfattachment | null;
    pdf: PDFDocumentLoadingTask | undefined;
    page: number;
    rotation: number;
}>, {
    modelValue: boolean;
    options: () => {
        thumbnails: boolean;
        bookmarks: boolean;
        attachments: boolean;
    };
    page: number;
    rotation: number;
}>, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    changePage: (...args: any[]) => void;
    "update:modelValue": (...args: any[]) => void;
}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<{
    modelValue: boolean;
    options: Record<string, Object>;
    outline?: Array<pdfOutlinePairs>;
    attachments?: pdfattachment | null;
    pdf: PDFDocumentLoadingTask | undefined;
    page: number;
    rotation: number;
}>, {
    modelValue: boolean;
    options: () => {
        thumbnails: boolean;
        bookmarks: boolean;
        attachments: boolean;
    };
    page: number;
    rotation: number;
}>>> & {
    "onUpdate:modelValue"?: ((...args: any[]) => any) | undefined;
    onChangePage?: ((...args: any[]) => any) | undefined;
}, {
    page: number;
    rotation: number;
    modelValue: boolean;
    options: Record<string, Object>;
}, {}>;
export default _default;
type __VLS_WithDefaults<P, D> = {
    [K in keyof Pick<P, keyof P>]: K extends keyof D ? __VLS_Prettify<P[K] & {
        default: D[K];
    }> : P[K];
};
type __VLS_Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
type __VLS_TypePropsToOption<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? {
        type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
    } : {
        type: import('vue').PropType<T[K]>;
        required: true;
    };
};
