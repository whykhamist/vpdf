import {
  Ref,
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useSizeObserver } from "./useSizeObserver";
import type { PageViewport } from "pdfjs-dist";
import type {
  OnProgressParameters,
  PDFDocumentProxy,
} from "pdfjs-dist/types/src/display/api";
import type {
  Bounds,
  Point,
  ScrollState,
  Size,
  pdfPageBounds,
  pdfPageInfo,
  pdfScrollState,
  pdfViewerOptions,
} from "../types/pdf";

export function usePdfViewer(
  container: Ref<HTMLElement | undefined>,
  options: pdfViewerOptions
) {
  const props = computed<Required<pdfViewerOptions>>(() => ({
    pdf: options.pdf,
    page: options?.page ?? 1,
    scale: options?.scale ?? 1,
    gap: options?.gap ?? 10,
    rotation: options?.rotation ?? 0,
    view: options?.view ?? "vertical",
    textLayer: options?.textLayer ?? false,
    smoothJump: options?.smoothJump ?? false,
    renderDelay: options?.renderDelay ?? 50,
    renderOffset: options?.renderOffset ?? 256,
    downScale: options?.downScale ?? 0.87,
  }));

  const totalPage = ref(0);
  const pageInfo = ref<Array<pdfPageInfo>>([]);
  const containerBounds = ref<Size>({
    width: 0,
    height: 0,
  });
  const scrollState = ref<pdfScrollState>({
    rAF: null,
    state: {
      right: true,
      down: true,
      lastX: 0,
      lastY: 0,
    },
    covered: {
      x: 0,
      y: 0,
    },
    timer: null,
  });
  const currentPage = ref(props.value.page ?? 1);
  const progress = ref<OnProgressParameters>();
  const render = ref(true);
  const bypassSmooth = ref(false);

  const visiblePages = ref<Array<pdfPageInfo>>([]);
  const scale = computed(() => props.value.scale ?? 1);
  const rotation = computed(() =>
    (props.value.rotation * 1) % 90 == 0 ? props.value.rotation * 1 : 0
  );
  const viewMode = computed(() => props.value.view.toLowerCase());
  const gap = computed(() => options?.gap ?? 10);

  const { observe, unobserve } = useSizeObserver((els) => {
    visiblePages.value = getVisiblePages(
      scrollState.value.state,
      els[0].target as HTMLElement
    );
  });

  const readPDF = async () => {
    if (!!props.value.pdf) {
      const { docId, promise } = props.value.pdf;
      let pdf = await promise;
      const { numPages } = pdf;

      updateProgress({ loaded: 0, total: 1 });
      await getPageInfo(pdf, docId, numPages);
      if (!!container.value) {
        currentPage.value = getCurrentPage(
          scrollState.value.state,
          container.value
        );
        visiblePages.value = getVisiblePages(
          scrollState.value.state,
          container.value
        );
      }
    }
  };

  const refresh = async () => {
    let p = currentPage.value;
    await readPDF();
    bypassSmooth.value = true;
    changePage(p);
    bypassSmooth.value = false;
  };

  const getPageInfo = async (
    pdf: PDFDocumentProxy,
    docId: string,
    numPages: number
  ): Promise<void> => {
    const { gap, dGap } = getGaps();
    const isVertical = viewMode.value == "vertical";

    let pages = [],
      lastViewport = null,
      lastPos = 0,
      max: Size = {
        width: isVertical ? 0 : gap,
        height: isVertical ? gap : 0,
      };

    totalPage.value = numPages;

    for (let i = 0; i < numPages; i++) {
      const pageNum = i + 1;
      const pageId = `${docId}_pdf_page_${pageNum}_${scale.value}_${rotation.value}`;
      let page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({
        scale: scale.value * props.value.downScale,
        rotation: rotation.value,
      });
      const pos = {
        x: 0,
        y: 0,
      };

      if (isVertical) {
        lastPos += (lastViewport?.height ?? 0) + gap + 2;
        max.height += viewport.height + gap + 2;
        max.width = Math.max(max.width, viewport.width + dGap);
        pos.y = Math.round(lastPos);
      } else {
        lastPos += (lastViewport?.width ?? 0) + gap + 2;
        max.height = Math.max(max.height, viewport.height + dGap);
        max.width += viewport.width + gap + 2;
        pos.x = Math.round(lastPos);
      }

      pages.push({
        id: pageId,
        scale: scale.value,
        rotation: rotation.value,
        page: pageNum,
        viewport,
        pos,
      });

      lastViewport = viewport.clone();

      page.cleanup();

      updateProgress({
        loaded: (i + 1) * 8,
        total: numPages * 8,
      });
    }

    (pages as Array<pdfPageInfo>).forEach((p) => {
      if (isVertical) {
        p.pos.x = Math.round(max.width / 2 - p.viewport.width / 2);
      } else {
        p.pos.y = Math.round(max.height / 2 - p.viewport.height / 2);
      }
      p.bounds = getBounds(p, isVertical);
    });

    pageInfo.value = pages as Array<pdfPageInfo>;
    containerBounds.value = max;
  };

  const getBounds = (
    pageInfo: pdfPageInfo,
    vertical: boolean = true
  ): pdfPageBounds => {
    const { gap, hGap } = getGaps();
    const { page, pos, viewport } = pageInfo;
    const firstHG = page > 1 ? hGap : gap;
    const lastHG = page < totalPage.value ? gap : hGap;
    const inner = getInnerBounds(pos, viewport);
    return vertical
      ? getVBounds(inner, gap, firstHG, lastHG)
      : getHBounds(inner, gap, firstHG, lastHG);
  };

  const getVBounds = (
    inner: Bounds,
    gap: number,
    firstHG: number,
    lastHG: number
  ): pdfPageBounds => {
    return {
      inner,
      outer: {
        top: inner.top - firstHG,
        bottom: inner.bottom + lastHG,
        left: inner.left - gap,
        right: inner.right + gap,
      },
    };
  };

  const getHBounds = (
    inner: Bounds,
    gap: number,
    firstHG: number,
    lastHG: number
  ): pdfPageBounds => {
    return {
      inner,
      outer: {
        top: inner.top - gap,
        bottom: inner.bottom + gap,
        left: inner.left - firstHG,
        right: inner.right + lastHG,
      },
    };
  };

  const getInnerBounds = (pos: Point, viewport: PageViewport): Bounds => {
    return {
      top: pos.y,
      bottom: pos.y + viewport.height,
      left: pos.x,
      right: pos.x + viewport.width,
    };
  };

  const getGaps = (): { gap: number; hGap: number; dGap: number } => {
    const gap = Math.abs(props.value.gap);
    return { gap, hGap: gap / 2, dGap: gap * 2 };
  };

  const updateProgress = (e: OnProgressParameters): void => {
    progress.value = e;
  };

  const getVisiblePages = (
    sState: ScrollState,
    container: HTMLElement
  ): Array<pdfPageInfo> => {
    const { lastY, lastX } = sState;
    const { clientHeight, clientWidth } = container;
    const bounds: Bounds = {
      top: lastY - props.value.renderOffset,
      left: lastX - props.value.renderOffset,
      right: lastX + clientWidth + props.value.renderOffset,
      bottom: lastY + clientHeight + props.value.renderOffset,
    };

    const filtered = pageInfo.value.filter((p) =>
      boundsIntersecting(p.bounds.outer, bounds)
    );
    return filtered;
  };

  const boundsIntersecting = (bounds1: Bounds, bounds2: Bounds): boolean => {
    const { top: top1, left: left1, right: right1, bottom: bottom1 } = bounds1;
    const { top: top2, left: left2, right: right2, bottom: bottom2 } = bounds2;
    return !(
      right2 < left1 ||
      left2 > right1 ||
      bottom2 < top1 ||
      top2 > bottom1
    );
  };

  const onContainerScroll = (e: Event) => {
    if (!scrollState.value.rAF) {
      const target = e.target as HTMLElement;
      scrollState.value.rAF = window.requestAnimationFrame(() => {
        if (scrollState.value.timer !== null) {
          clearTimeout(scrollState.value.timer);
          render.value = false;
        }
        scrollState.value.rAF = null;
        const currentX = target!.scrollLeft;
        const lastX = scrollState.value.state.lastX;
        if (currentX !== lastX) {
          scrollState.value.state.right = currentX > lastX;
        }
        scrollState.value.state.lastX = currentX;

        const currentY = target!.scrollTop;
        const lastY = scrollState.value.state.lastY;
        if (currentY !== lastY) {
          scrollState.value.state.down = currentY > lastY;
        }
        scrollState.value.state.lastY = currentY;

        scrollState.value.covered.y = Math.round(
          ((currentY + target.clientHeight) / target.scrollHeight) * 100
        );
        scrollState.value.covered.x = Math.round(
          ((currentX + target.clientWidth) / target.scrollWidth) * 100
        );
        visiblePages.value = getVisiblePages(scrollState.value.state, target);

        scrollState.value.timer = setTimeout(() => {
          let p = getCurrentPage(scrollState.value.state, target);
          if (currentPage.value != p) {
            currentPage.value = p;
          }
          render.value = true;
        }, props.value.renderDelay);
      });
    }
  };

  const inRange = (x: number, min: number, max: number) => {
    return (x - min) * (x - max) <= 0;
  };

  const getCurrentPage = (sState: ScrollState, target: HTMLElement): number => {
    let pos: number = 0,
      minKey: "top" | "bottom" | "left" | "right" = "top",
      maxKey: "top" | "bottom" | "left" | "right" = "bottom";
    if (viewMode.value == "vertical") {
      pos = sState.lastY + target.clientHeight / 2;
      minKey = "top";
      maxKey = "bottom";
    } else {
      pos = sState.lastX + target.clientWidth / 2;
      minKey = "left";
      maxKey = "right";
    }
    return (
      pageInfo.value.find((p) =>
        inRange(pos, p.bounds.outer[minKey], p.bounds.outer[maxKey])
      )?.page ?? 1
    );
  };

  const nextPage = () => {
    let p = currentPage.value + 1;
    changePage(Math.min(p, totalPage.value));
  };

  const prevPage = () => {
    let p = currentPage.value - 1;
    changePage(Math.max(p, 1));
  };

  const changePage = (page: number, offset: Point | null = null) => {
    const pInfo = pageInfo.value.find((p) => p.page == (page ?? 1));
    const containerSize = container.value;
    currentPage.value = page;
    if (!!pInfo) {
      const { gap, hGap } = getGaps();
      const { top, left } = pInfo.bounds.outer;
      const viewport = pInfo.viewport;
      const scroll: ScrollToOptions = {
        top,
        left,
        behavior:
          props.value.smoothJump && !bypassSmooth.value ? "smooth" : "auto",
      };
      let offY = pageOffset(offset?.y ?? 0, viewport.height, page, gap);
      let offX = Math.floor(
        (offset?.x ?? 0) * (scale.value * props.value.downScale)
      );

      if (viewMode.value == "vertical") {
        if (viewport.height < (containerSize?.clientHeight ?? 0)) {
          scroll.top =
            Math.round(
              top - (containerSize?.clientHeight ?? 0) / 2 + viewport.height / 2
            ) - hGap;
        } else {
          scroll.top = top - (gap + hGap);
        }
      } else {
        if (viewport.width < (containerSize?.clientWidth ?? 0)) {
          scroll.left =
            Math.round(
              left - (containerSize?.clientWidth ?? 0) / 2 + viewport.width / 2
            ) + hGap;
        } else {
          scroll.left = left - (gap + hGap);
        }
      }
      scroll.top = (scroll.top ?? top) + offY;
      scroll.left = (scroll.left ?? left) + offX;
      container.value?.scrollTo(scroll);
    }
  };

  const pageOffset = (
    initial: number,
    size: number,
    page: number,
    gap: number
  ): number => {
    return !!initial
      ? Math.floor(size - initial * (scale.value * props.value.downScale))
      : page > 1
        ? gap
        : 0;
  };

  const fitPage = (mode: "width" | "height" | "fit" = "fit") => {
    const page = pageInfo.value.find((p) => p.page == currentPage.value);
    const viewport = page!.viewport;
    const { dGap } = getGaps();
    let sf = page!.scale;
    const hsf = ((container.value!.clientHeight - dGap) / viewport.height) * sf;
    const wsf = ((container.value!.clientWidth - dGap) / viewport.width) * sf;
    const fit = { width: wsf, height: hsf, fit: Math.min(wsf, hsf) };
    return fit[mode];
  };

  watch([() => props.value.pdf, scale, rotation, viewMode, gap], refresh, {
    deep: true,
  });

  watch(container, (val) => {
    if (!!val) {
      observe(val);
    } else {
      unobserve();
    }
  });

  onMounted(async () => {
    await nextTick();
    scrollState.value.state.lastX = container.value?.scrollLeft ?? 0;
    scrollState.value.state.lastY = container.value?.scrollTop ?? 0;
    container.value?.addEventListener("scroll", onContainerScroll, true);
    if (!!props.value.pdf) {
      await readPDF();

      if (!!props.value.page) {
        changePage(props.value.page);
      }
    }
  });

  onBeforeUnmount(() => {
    container.value?.removeEventListener("scroll", onContainerScroll, true);
    unobserve();
  });

  return {
    totalPage,
    pageInfo,
    containerBounds,
    // scrollState,
    progress,
    render,
    currentPage,
    visiblePages,
    scale,
    rotation,
    viewMode,
    // readPDF,
    refresh,
    // getPageInfo,
    // getBounds,
    // getVBounds,
    // getHBounds,
    // getInnerBounds,
    // getGaps,
    // getVisiblePages,
    // boundsIntersecting,
    // onContainerScroll,
    // inRange,
    // getCurrentPage,
    nextPage,
    prevPage,
    changePage,
    fitWidth: () => fitPage("width"),
    fitHeight: () => fitPage("height"),
    fitPage,
  };
}
