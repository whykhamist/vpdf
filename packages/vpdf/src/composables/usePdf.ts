import "../utils/polyfill";
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
  type OnProgressParameters,
} from "pdfjs-dist";
import PDFWorker from "pdfjs-dist/legacy/build/pdf.worker.min?url";
import {
  onBeforeUnmount,
  onMounted,
  type Ref,
  ref,
  shallowRef,
  toRef,
  toValue,
  watch,
} from "vue";
import type {
  pdfOptions,
  pdfOutline,
  pdfOutlinePairs,
  pdfOutlineDest,
  pdfattachment,
  pdfSource,
} from "../types/pdf";

const setWorker = (worker: string) => {
  if (!GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = worker;
  }
};

export function usePdf(src: Ref<pdfSource> | pdfSource, options?: pdfOptions) {
  setWorker(options?.workerSrc || PDFWorker);

  const pdfSrc = toRef(src);
  const pdf = shallowRef<PDFDocumentLoadingTask>();
  const doc = shallowRef<PDFDocumentProxy>();
  const pages = shallowRef(0);
  const outline = shallowRef<Array<pdfOutlinePairs>>();
  const attachments = shallowRef<pdfattachment>();
  const javascript = shallowRef();
  const metadata = shallowRef();

  // const states = ref({
  //   loading: false,
  //   progress: 0,
  // });

  const loading = ref(false);
  const progress = ref(0);

  const readDocument = async () => {
    try {
      if (doc.value) {
        cleanup();
        doc.value.destroy();
      }

      loading.value = true;
      const loadingTask = getDocument(toValue(src));
      loadingTask.onPassword = setPassword(options?.password);
      loadingTask.onProgress = onPdfProgress;
      doc.value = await loadingTask.promise;
      pdf.value = doc.value.loadingTask;
      pages.value = doc.value.numPages;
      outline.value = await getOutlines(doc.value);
      attachments.value = await doc.value.getAttachments();
      metadata.value = await doc.value.getMetadata();
      javascript.value = await doc.value.getJSActions();

      Object.assign(metadata.value, {
        fingerprint: doc.value.fingerprints,
      });
    } catch (e: any) {
      onPdfProgress({ loaded: 1, total: 1 });
      options?.onError?.(e);
    } finally {
      loading.value = false;
    }
  };

  const cleanup = () => {
    pdf.value?.promise.then((doc: PDFDocumentProxy) => {
      doc.cleanup();
    });
    pdf.value?.destroy();
    pages.value = 0;
    outline.value = undefined;
    attachments.value = undefined;
  };

  const onPdfProgress = (e: OnProgressParameters) => {
    options?.onProgress?.(e);
    progress.value = Math.floor(e.loaded / e.total) * 100;
  };

  const setPassword = (pass?: string) => {
    return pass ? (cb: Function, _: number) => cb(pass) : onPassword;
  };

  const onPassword = (updatePassword: Function, reason: number) => {
    if (!!options?.onPassword && typeof options?.onPassword === "function") {
      options.onPassword(updatePassword, reason);
    } else {
      if (reason == 1) {
        const pass = prompt("Enter password for protected PDF");
        updatePassword(pass ?? "");
      } else if (reason == 2) {
        throw new Error("Password is required for this document");
      }
    }
  };

  const getOutlines = async (
    doc: PDFDocumentProxy,
    ol: pdfOutline | null = null,
  ): Promise<Array<pdfOutlinePairs>> => {
    let pairs: Array<pdfOutlinePairs> = [];

    let _outline: pdfOutline = ol ?? (await doc.getOutline());
    if (_outline) {
      for await (const { dest, title, items } of _outline) {
        let d = dest;
        if (typeof dest === "string") {
          d = await doc.getDestination(dest);
        }
        const page = await getOutlinePage(doc, d);
        if (!!page || (!page && items.length > 0)) {
          pairs.push({
            page,
            offsetY: d?.[3],
            offsetX: d?.[2],
            title,
            sub: await getOutlines(doc, items),
          });
        }
      }
    }
    return pairs;
  };

  const getOutlinePage = async (
    doc: PDFDocumentProxy,
    dest: pdfOutlineDest,
  ): Promise<number | null> => {
    const r = dest?.[0];
    if (r) {
      const id = await doc.getPageIndex(r);
      return id + 1;
    }
    return null;
  };

  watch(pdfSrc, readDocument, { deep: true });

  onMounted(readDocument);

  onBeforeUnmount(cleanup);

  return {
    pdf,
    pages,
    outline,
    attachments,
    metadata,
    javascript,
    progress,
    loading,
  };
}
