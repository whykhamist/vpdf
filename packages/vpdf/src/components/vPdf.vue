<script setup lang="ts">
import { defineAsyncComponent, ref, computed, toRef, watch } from "vue";
import { pdfSource, Point } from "../types/pdf";
import { usePdf } from "../composables/usePdf";
import type { OnProgressParameters } from "pdfjs-dist/types/src/display/api";

const PDFViewer = defineAsyncComponent(() => import("./vPdfViewer.vue"));
const PDFMenu = defineAsyncComponent(() => import("./menu/index.vue"));
const PDFDialog = defineAsyncComponent(() => import("./dialog/index.vue"));
const PDFPassword = defineAsyncComponent(() => import("./password/index.vue"));
const PDFSideBar = defineAsyncComponent(() => import("./sidebar/index.vue"));
const Progress = defineAsyncComponent(() => import("./progress/index.vue"));

type IProps = {
  src: pdfSource;
  workerSrc?: string;
  smoothJump?: boolean;
  textLayer?: boolean;
  password?: string;
  onPassword?: (callback: Function, reason: number) => {};
};

type IViewerOptions = {
  mode: "vertical" | "horizontal";
  scale: number;
  sidebar: boolean;
  rotation: number;
};

type IDialog = {
  show: boolean;
  data: any;
  type: string;
  persistent: boolean;
};

const props = withDefaults(defineProps<IProps>(), {
  smoothJump: false,
  textLayer: false,
});

const viewer = ref<typeof PDFViewer>();
const menu = ref<typeof PDFMenu>();
const error = ref();
const progress = ref({
  loader: 0,
  viewer: 0,
});
const viewerOptions = ref<IViewerOptions>({
  mode: "vertical",
  scale: 1.75,
  sidebar: false,
  rotation: 0,
});

const dialog = ref<IDialog>({
  show: false,
  data: undefined,
  type: "",
  persistent: false,
});

const openDialog = (data: any, type: string, persistent: boolean = false) => {
  dialog.value.data = data;
  dialog.value.persistent = persistent;
  dialog.value.type = type;
  dialog.value.show = true;
};

const { pdf, pages, loading, outline, attachments } = usePdf(
  toRef(() => props.src),
  {
    workerSrc: props.workerSrc,
    password: props.password,
    onPassword: (callback, reason) => {
      if (!!props.onPassword && typeof props.onPassword === "function") {
        typeof props.onPassword(callback, reason);
      } else if (reason >= 1) {
        openDialog(
          {
            reason,
            cb: (pass: string) => {
              callback(pass);
              dialog.value.show = false;
            },
          },
          "passwordPrompt",
          true
        );
      }
    },
    onProgress: (e: OnProgressParameters) => {
      progress.value.loader = (e.loaded / e.total) * 85;
    },
    onError: (e) => {
      error.value = e;
    },
  }
);

const sidebarOptions = computed(() => ({
  thumbnails: true,
  bookmarks: true,
  attachments: true,
}));

const onViewerProgress = (e: OnProgressParameters) => {
  progress.value.viewer = (e.loaded / e.total) * 15;
};

const changePage = (page: number, offset: Point | null = null) => {
  viewer.value?.changePage(page, offset);
};

const fitPage = (mode: "fit" | "width" | "height" = "fit") => {
  viewerOptions.value.scale = viewer.value?.fitPage(mode);
};

const onMouseWheel = (e: any) => {
  if (e.ctrlKey) {
    e.preventDefault();
    const scales = menu.value?.scales;
    let scaleIndex = scales.findIndex(
      (s: any) => s.value == viewerOptions.value.scale
    );
    if (e.wheelDeltaY > 0) {
      scaleIndex =
        scaleIndex > -1
          ? scaleIndex
          : scales.findIndex((s: any) => s.value >= viewerOptions.value.scale) -
            1;
      scaleIndex = Math.min(
        scaleIndex + 1,
        scales.filter((s: any) => !!s.value).length - 1
      );
    } else {
      scaleIndex =
        scaleIndex > -1
          ? scaleIndex
          : scales.findLastIndex(
              (s: any) => s.value <= viewerOptions.value.scale
            ) + 1;
      scaleIndex = Math.max(scaleIndex - 1, 0);
    }
    viewerOptions.value.scale = scales[scaleIndex].value;
  }
};

watch(
  () => props.src,
  () => {
    progress.value = {
      loader: 0,
      viewer: 0,
    };
    dialog.value.show = false;
    error.value = undefined;
  }
);
</script>

<template>
  <div
    class="relative flex h-full flex-col border border-gray-400/25 bg-background text-foreground"
  >
    <PDFMenu
      ref="menu"
      :pages="pages"
      :page="viewer?.currentPage ?? 1"
      :loading="loading"
      v-model:mode="viewerOptions.mode"
      v-model:scale="viewerOptions.scale"
      v-model:sidebar="viewerOptions.sidebar"
      v-model:rotation="viewerOptions.rotation"
      @fitPage="fitPage"
      @update:page="changePage"
    >
      <template #prepend>
        <div class="absolute inset-x-0 bottom-0">
          <Progress
            v-if="progress.loader + progress.viewer < 100"
            :value="+(progress.loader + progress.viewer).toFixed(2)"
            class="h-0.5 w-full"
          />
        </div>
        <div
          v-if="!!error"
          class="absolute top-full z-20 w-full bg-negative px-2 py-1 text-sm font-semibold leading-none text-rose-50"
        >
          {{ error.message }}
        </div>
      </template>
    </PDFMenu>
    <div class="relative flex min-h-0 min-w-0 flex-auto">
      <PDFSideBar
        v-if="!error"
        v-model="viewerOptions.sidebar"
        :pdf="pdf"
        :options="sidebarOptions"
        :outline="outline"
        :attachments="attachments"
        :page="viewer?.currentPage ?? 1"
        :rotation="viewerOptions.rotation"
        @changePage="(e) => changePage(e.page, e.offset)"
      />
      <PDFViewer
        v-if="!!pdf && !loading && !error"
        ref="viewer"
        :pdf="pdf"
        :smoothJump="smoothJump"
        :view="viewerOptions.mode"
        :textLayer="textLayer"
        :rotation="viewerOptions.rotation"
        @progress="onViewerProgress"
        v-model:scale="viewerOptions.scale"
        class="max-h-full min-h-0 min-w-0 flex-auto transition-all"
        :class="{
          'md:ml-64': viewerOptions.sidebar && !error,
        }"
        @wheel="onMouseWheel"
        @mousewheel="onMouseWheel"
      />
    </div>
    <PDFDialog
      v-model="dialog.show"
      :persistent="dialog.persistent"
      v-slot="{ close }"
      class="z-20"
    >
      <PDFPassword
        :callback="dialog.data.cb"
        :reason="dialog.data.reason"
        class=""
      />
    </PDFDialog>
  </div>
</template>
