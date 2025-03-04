import type { PDFDocumentLoadingTask } from "pdfjs-dist/types/src/display/api";
declare const _default: import("vue").DefineComponent<__VLS_TypePropsToOption<{
    pdf: PDFDocumentLoadingTask;
    page: number;
    rotation: number;
}>, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    changePage: (...args: any[]) => void;
}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<__VLS_TypePropsToOption<{
    pdf: PDFDocumentLoadingTask;
    page: number;
    rotation: number;
}>>> & {
    onChangePage?: ((...args: any[]) => any) | undefined;
}, {}, {}>;
export default _default;
type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
type __VLS_TypePropsToOption<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? {
        type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
    } : {
        type: import('vue').PropType<T[K]>;
        required: true;
    };
};
