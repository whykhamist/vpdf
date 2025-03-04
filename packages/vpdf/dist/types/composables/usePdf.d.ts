import "../utils/polyfill";
import { Ref } from "vue";
import type { pdfOptions, pdfOutlinePairs, pdfattachment, pdfSource } from "../types/pdf";
export declare function usePdf(src: Ref<pdfSource> | pdfSource, options?: pdfOptions): {
    pdf: import("vue").ShallowRef<import("pdfjs-dist/types/src/display/api").PDFDocumentLoadingTask | undefined>;
    pages: import("vue").ShallowRef<number>;
    outline: import("vue").ShallowRef<pdfOutlinePairs[] | undefined>;
    attachments: import("vue").ShallowRef<pdfattachment | undefined>;
    metadata: import("vue").ShallowRef<any>;
    progress: Ref<number>;
    javascript: import("vue").ShallowRef<any>;
    loading: Ref<boolean>;
};
