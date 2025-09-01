<script setup lang="ts">
import { ref, computed, toRef, watch } from "vue";
import type { pdfSource, Point } from "../types/pdf";
import { usePdf } from "../composables/usePdf";
import type { OnProgressParameters } from "pdfjs-dist/types/src/display/api";

import PDFViewer from "./vPdfViewer.vue";
import PDFMenu from "./menu/index.vue";
import PDFDialog from "./dialog/index.vue";
import PDFPassword from "./password/index.vue";
import PDFSideBar from "./sidebar/index.vue";
import Progress from "./progress/index.vue";
import { log, useScales, useTouchZoom } from "../composables";
import BottomMenu from "./menu/bottom.vue";

type IViewerOptions = {
  mode: "vertical" | "horizontal";
  sidebar: boolean;
  scale: number;
  rotation: number;
};

type IDialog = {
  show: boolean;
  data: any;
  type: string;
  persistent: boolean;
};

const props = withDefaults(
  defineProps<{
    src: pdfSource;
    workerSrc?: string;
    smoothJump?: boolean;
    textLayer?: boolean;
    password?: string;
    scale?: number;
    page?: number;
    onPassword?: (callback: Function, reason: number) => {};
  }>(),
  {
    smoothJump: false,
    textLayer: false,
  },
);

const viewer = ref<typeof PDFViewer>();
const menu = ref<typeof PDFMenu>();
const error = ref();
const scaleTimer = ref();
const progress = ref({
  loader: 0,
  viewer: 0,
});
const viewerOptions = ref<IViewerOptions>({
  mode: "vertical",
  sidebar: false,
  scale: props.scale ?? 1,
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
          true,
        );
      }
    },
    onProgress: (e: OnProgressParameters) => {
      progress.value.loader = (e.loaded / e.total) * 85;
    },
    onError: (e) => {
      error.value = e;
    },
  },
);

const {
  scale: _scale,
  scales: _scales,
  next: nextScale,
  prev: prevScale,
} = useScales(props.scale);

const { touching, touchStart, touchMove, touchEnd } = useTouchZoom(
  (zoomin, zoomout, distance) => {
    // log("IN: ", zoomin, "OUT: ", zoomout, "DISTANCE: ", distance);
    // zoomin ? nextScale() : prevScale();
    if (zoomin) {
      nextScale();
    } else if (zoomout) {
      prevScale();
    }
  },
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

const onMouseWheel = (e: any) => {
  if (e.ctrlKey) {
    e.preventDefault();
    e.wheelDeltaY > 0 ? nextScale() : prevScale();
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
  },
);

watch(_scale, (val) => {
  clearTimeout(scaleTimer.value);
  scaleTimer.value = setTimeout(
    () => {
      viewerOptions.value.scale = val;
    },
    touching.value ? 500 : 10,
  );
});

watch(
  () => viewerOptions.value.scale,
  (val) => {
    _scale.value = val;
  },
);
</script>

<template>
  <div
    class="vpdf:relative vpdf:flex vpdf:h-full vpdf:flex-col vpdf:border vpdf:border-gray-400/25 vpdf:bg-background vpdf:text-foreground"
  >
    <PDFMenu
      ref="menu"
      :pages="pages"
      :page="viewer?.currentPage ?? 1"
      :loading
      :scales="_scales"
      v-model:mode="viewerOptions.mode"
      v-model:scale="_scale"
      v-model:sidebar="viewerOptions.sidebar"
      v-model:rotation="viewerOptions.rotation"
      @update:page="changePage"
      class="vpdf:border-b vpdf:border-foreground/25"
    >
      <template #prepend>
        <div class="vpdf:absolute vpdf:inset-x-0 vpdf:bottom-0">
          <Progress
            v-if="progress.loader + progress.viewer < 100"
            :value="+(progress.loader + progress.viewer).toFixed(2)"
            class="vpdf:h-0.5 vpdf:w-full"
          />
        </div>
        <div
          v-if="!!error"
          class="vpdf:absolute vpdf:top-full vpdf:z-20 vpdf:w-full vpdf:bg-negative vpdf:px-2 vpdf:py-1 vpdf:text-sm vpdf:leading-none vpdf:font-semibold vpdf:text-negative-50"
        >
          {{ error.message }}
        </div>
      </template>
    </PDFMenu>
    <div
      class="vpdf:relative vpdf:flex vpdf:min-h-0 vpdf:min-w-0 vpdf:flex-auto"
      @wheel="onMouseWheel"
      @mousewheel="onMouseWheel"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    >
      <PDFSideBar
        v-if="!error"
        v-model="viewerOptions.sidebar"
        :pdf="pdf"
        :options="sidebarOptions"
        :outline="outline"
        :attachments="attachments"
        :page="viewer?.currentPage ?? 1"
        :rotation="viewerOptions.rotation"
        @changePage="(e: any) => changePage(e.page, e.offset)"
      />
      <PDFViewer
        v-if="!!pdf && !loading && !error"
        ref="viewer"
        :pdf="pdf"
        :smoothJump="smoothJump"
        :view="viewerOptions.mode"
        :textLayer="textLayer"
        :rotation="viewerOptions.rotation"
        :scaling="_scale"
        :page
        v-model:scale="viewerOptions.scale"
        class="vpdf:max-h-full vpdf:min-h-0 vpdf:min-w-0 vpdf:flex-auto vpdf:transition-all"
        :class="{
          'vpdf:md:ml-72': viewerOptions.sidebar && !error,
          'vpdf:md:ml-0': !viewerOptions.sidebar && !error,
        }"
        @progress="onViewerProgress"
      />

      <BottomMenu
        :page="viewer?.currentPage ?? 1"
        v-model:scale="viewerOptions.scale"
        :scales="_scales"
        :pages
        :pageMode="viewerOptions.mode"
        @update:page="changePage"
      />
    </div>
    <PDFDialog
      v-model="dialog.show"
      :persistent="dialog.persistent"
      v-slot="{ close }"
      class="vpdf:z-20"
    >
      <PDFPassword
        :callback="dialog.data.cb"
        :reason="dialog.data.reason"
        class=""
      />
    </PDFDialog>
  </div>
</template>
