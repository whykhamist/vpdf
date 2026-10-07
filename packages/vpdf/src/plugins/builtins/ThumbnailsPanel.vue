<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, watch } from "vue";
import {
  THUMBNAIL_CSS_WIDTH,
  clearThumbnailPreview,
  isRenderCancelled,
  renderPdfThumbnail,
  type ThumbnailPage,
  type VPdfXfaThumbnailRasterizer,
} from "../../utils/renderThumbnail";

type ThumbStatus = "idle" | "loading" | "ready" | "error";

const DEFAULT_THUMBNAIL_COLUMNS = 2;

function resolveThumbnailColumns(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_THUMBNAIL_COLUMNS;
  return Math.floor(n);
}

const props = defineProps<{
  pageCount: number;
  pageNumber: number;
  rotation?: 0 | 90 | 180 | 270;
  ready?: boolean;
  documentKey?: string;
  columns?: number;
  getPage: (pageNumber: number) => Promise<ThumbnailPage | undefined>;
  onGoToPage: (page: number) => void;
  rasterizeXfa?: VPdfXfaThumbnailRasterizer;
}>();

const columns = computed(() => resolveThumbnailColumns(props.columns));

const statuses = reactive<Record<number, ThumbStatus>>({});
const elements = new Map<number, HTMLElement>();
const tasks = new Map<number, { cancel: () => void }>();
const inflight = new Set<number>();
const visiblePages = new Set<number>();
let session = 0;
let observer: IntersectionObserver | undefined;

function documentEpoch(): string {
  return `${props.documentKey ?? ""}:${props.pageCount}:${props.ready ? 1 : 0}:${props.rotation ?? 0}:${columns.value}`;
}

function scrollCurrentIntoView() {
  elements
    .get(props.pageNumber)
    ?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
}

function statusOf(page: number): ThumbStatus {
  return statuses[page] ?? "idle";
}

function cancelTask(page: number) {
  tasks.get(page)?.cancel();
  tasks.delete(page);
}

function cancelAll() {
  for (const page of [...tasks.keys()]) cancelTask(page);
}

function observeThumb(page: number, el: unknown) {
  if (!(el instanceof HTMLElement)) {
    const previous = elements.get(page);
    if (previous && !previous.isConnected) {
      observer?.unobserve(previous);
      elements.delete(page);
    }
    return;
  }
  if (elements.get(page) === el) return;
  const previous = elements.get(page);
  if (previous) observer?.unobserve(previous);
  elements.set(page, el);
  if (observer) observer.observe(el);
  else if (props.ready) queueRender(page);
  if (page === props.pageNumber) void nextTick(scrollCurrentIntoView);
}

function onIntersect(entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    const page = Number((entry.target as HTMLElement).dataset.page);
    if (entry.isIntersecting && Number.isInteger(page) && page > 0) {
      visiblePages.add(page);
      queueRender(page);
    } else {
      visiblePages.delete(page);
    }
  }
}

function ensureObserver() {
  if (observer || typeof IntersectionObserver === "undefined") return;
  observer = new IntersectionObserver(onIntersect, {
    rootMargin: "160px 0px",
    threshold: 0.01,
  });
  for (const el of elements.values()) observer.observe(el);
}

function queueRender(page: number) {
  if (!props.ready || page < 1 || page > props.pageCount) return;
  if (statusOf(page) === "ready" || inflight.has(page)) return;
  void renderPage(page);
}

async function renderPage(page: number) {
  if (!props.ready || page < 1 || page > props.pageCount) return;
  if (statusOf(page) === "ready" || inflight.has(page)) return;

  const current = session;
  const wrap = elements.get(page)?.querySelector(".vpdf-thumb-canvas-wrap");
  const canvas = wrap?.querySelector("canvas");
  if (!(wrap instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement))
    return;

  inflight.add(page);
  statuses[page] = "loading";
  cancelTask(page);

  try {
    const pdfPage = await props.getPage(page);
    if (current !== session) return;
    if (!pdfPage) {
      statuses[page] = "error";
      return;
    }

    const task = renderPdfThumbnail(pdfPage, canvas, {
      rotation: props.rotation ?? 0,
      pixelRatio: typeof window === "undefined" ? 1 : window.devicePixelRatio,
      cssWidth: wrap.clientWidth || THUMBNAIL_CSS_WIDTH,
      wrap,
      rasterizeXfa: props.rasterizeXfa,
    });
    tasks.set(page, task);
    await task.promise;
    if (current !== session) return;

    statuses[page] = "ready";
  } catch (error) {
    if (current !== session || isRenderCancelled(error)) return;
    statuses[page] = "error";
  } finally {
    inflight.delete(page);
    if (current === session) tasks.delete(page);
  }
}

function resetAndRenderVisible() {
  session += 1;
  cancelAll();
  inflight.clear();
  for (const key of Object.keys(statuses)) delete statuses[Number(key)];
  for (const el of elements.values()) {
    const wrap = el.querySelector(".vpdf-thumb-canvas-wrap");
    const canvas = wrap?.querySelector("canvas");
    if (wrap instanceof HTMLElement && canvas instanceof HTMLCanvasElement) {
      clearThumbnailPreview(canvas, wrap);
    }
  }
  if (!props.ready || props.pageCount === 0) return;
  ensureObserver();
  const pages = visiblePages.size > 0 ? visiblePages : elements.keys();
  for (const page of pages) queueRender(page);
}

watch(documentEpoch, resetAndRenderVisible, { immediate: true });
watch(() => props.rasterizeXfa, resetAndRenderVisible);
watch(
  () => props.pageNumber,
  () => {
    void nextTick(scrollCurrentIntoView);
  },
);

onBeforeUnmount(() => {
  session += 1;
  cancelAll();
  observer?.disconnect();
  observer = undefined;
  elements.clear();
  inflight.clear();
  visiblePages.clear();
});
</script>

<template>
  <div
    class="vpdf-thumbnails vpdf:mx-auto"
    :style="{ '--vpdf-thumb-cols': columns }"
  >
    <button
      v-for="page in pageCount"
      :key="`${documentKey ?? ''}:${page}`"
      :ref="(el) => observeThumb(page, el)"
      type="button"
      class="vpdf-thumb"
      :data-page="page"
      :data-status="statusOf(page)"
      :aria-current="pageNumber === page ? 'page' : undefined"
      :aria-label="`Go to page ${page}`"
      @click="onGoToPage(page)"
    >
      <span class="vpdf-thumb-canvas-wrap">
        <canvas class="vpdf-thumb-canvas" aria-hidden="true" />
        <span
          v-if="statusOf(page) === 'idle' || statusOf(page) === 'loading'"
          class="vpdf-thumb-skeleton"
          aria-hidden="true"
        />
        <span v-else-if="statusOf(page) === 'error'" class="vpdf-thumb-error"
          >Preview unavailable</span
        >
      </span>
      <span class="vpdf-thumb-label">{{ page }}</span>
    </button>
    <p v-if="pageCount === 0" class="vpdf-text-muted">No pages</p>
  </div>
</template>
