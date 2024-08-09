import "../utils/polyfill";
import * as pdfjs from "pdfjs-dist";
import PDFWorker from "pdfjs-dist/legacy/build/pdf.worker.min?url";
import {
  onBeforeUnmount,
  onMounted,
  Ref,
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
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = worker;
  }
};

export function usePdf(src: Ref<pdfSource> | pdfSource, options?: pdfOptions) {
  setWorker(options?.workerSrc ?? PDFWorker);

  const pdfSrc = toRef(src);
  const pdf = shallowRef<pdfjs.PDFDocumentLoadingTask>();
  const doc = shallowRef<pdfjs.PDFDocumentProxy>();
  const pages = shallowRef(0);
  const outline = shallowRef<Array<pdfOutlinePairs>>();
  const attachments = shallowRef<pdfattachment>();
  const js = shallowRef();
  const metadata = shallowRef();

  const _progress = ref(0);
  const _loading = ref(false);

  const readDocument = async () => {
    try {
      if (doc.value) {
        cleanup();
        doc.value.destroy();
      }

      _loading.value = true;
      const loadingTask = pdfjs.getDocument(toValue(src));
      if (!!options?.password) {
        loadingTask.onPassword = (cb: Function, _: any) => {
          cb(options?.password ?? "");
        };
      } else {
        loadingTask.onPassword = onPdfPassword;
      }
      loadingTask.onProgress = onPdfProgress;

      doc.value = await loadingTask.promise;
      pdf.value = doc.value.loadingTask;
      pages.value = doc.value.numPages;
      outline.value = await getOutlines(doc.value);
      attachments.value = await doc.value.getAttachments();
      metadata.value = await doc.value.getMetadata();
      js.value = await doc.value.getJSActions();
      Object.assign(metadata.value, {
        fingerprint: doc.value.fingerprints,
      });
    } catch (e: any) {
      onPdfProgress({
        loaded: 1,
        total: 1,
      });
      options?.onError?.(e);
    } finally {
      _loading.value = false;
    }
  };

  const cleanup = () => {
    pdf.value?.promise.then((doc: pdfjs.PDFDocumentProxy) => {
      doc.cleanup();
    });
    pdf.value?.destroy();
    pages.value = 0;
    outline.value = undefined;
    attachments.value = undefined;
  };

  const onPdfProgress = (e: pdfjs.OnProgressParameters) => {
    options?.onProgress?.(e);
    _progress.value = Math.floor(e.loaded / e.total) * 100;
  };

  const onPdfPassword = (updatePassword: Function, reason: Number) => {
    if (!!options?.onPassword && typeof options?.onPassword === "function") {
      options.onPassword(updatePassword, reason);
    } else {
      if (reason == 1) {
        const pass = prompt("Enter password for protected PDF");
        updatePassword(pass ?? "");
      } else if (reason == 2) {
        throw new Error();
      }
    }
  };

  const getOutlines = async (
    doc: pdfjs.PDFDocumentProxy,
    ol: pdfOutline | null = null
  ): Promise<Array<pdfOutlinePairs>> => {
    let pairs: Array<pdfOutlinePairs> = [];

    let _outline: pdfOutline = ol ?? (await doc.getOutline());
    if (!!_outline) {
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
    doc: pdfjs.PDFDocumentProxy,
    dest: pdfOutlineDest
  ): Promise<number | null> => {
    const r = dest?.[0];
    if (!!r) {
      const id = await doc.getPageIndex(r);
      return id + 1;
    }
    return null;
  };

  watch(pdfSrc, readDocument, { deep: true });

  onMounted(readDocument);

  onBeforeUnmount(cleanup);

  return {
    pdf: pdf,
    pages: pages,
    outline: outline,
    attachments: attachments,
    metadata: metadata,
    progress: _progress,
    javascript: js,
    loading: _loading,
  };
}
