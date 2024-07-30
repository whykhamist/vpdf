<script setup lang="ts">
import { defineAsyncComponent, ref, computed, toRef, watch } from "vue";
import { pdfSource, Point } from "../types/pdf";
import { usePdf } from "../composables/usePdf";
import type { OnProgressParameters } from "pdfjs-dist/types/src/display/api";

// import PDFViewer from "./vPdfViewer.vue";
// import PDFMenu from "./menu/index.vue";
// import PDFDialog from "./dialog/index.vue";
// import PDFPassword from "./password/index.vue";
// import PDFSideBar from "./sidebar/index.vue";
const PDFViewer = defineAsyncComponent(() => import("./vPdfViewer.vue"));
const PDFMenu = defineAsyncComponent(() => import("./menu/index.vue"));
const PDFDialog = defineAsyncComponent(() => import("./dialog/index.vue"));
const PDFPassword = defineAsyncComponent(() => import("./password/index.vue"));
const PDFSideBar = defineAsyncComponent(() => import("./sidebar/index.vue"));
const Progress = defineAsyncComponent(() => import("./progress/index.vue"));

const props = withDefaults(
  defineProps<{
    src: pdfSource;
    workerSrc?: string;
    smoothJump?: boolean;
    textLayer?: boolean;
    password?: string;
    onPassword?: (callback: Function, reason: number) => {};
  }>(),
  {
    smoothJump: false,
    textLayer: false,
  }
);

const viewer = ref<typeof PDFViewer>();
const menu = ref<typeof PDFMenu>();
const progress = ref<OnProgressParameters>();
const viewerOptions = ref<{
  mode: "vertical" | "horizontal";
  scale: number;
  sidebar: boolean;
  rotation: number;
}>({
  mode: "vertical",
  scale: 1,
  sidebar: false,
  rotation: 0,
});

const dialog = ref<{
  show: boolean;
  data: any;
  type: string;
  persistent: boolean;
}>({
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
      progress.value = e;
    },
  }
);

const sidebarOptions = computed(() => ({
  thumbnails: true,
  bookmarks: {
    outline: outline.value,
  },
  attachments: true,
}));

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
    progress.value = undefined;
    dialog.value.show = false;
  }
);
</script>

<template>
  <div class="relative flex h-full flex-col border border-gray-400/25 bg-white">
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
            v-if="loading"
            :total="progress?.total ?? 0"
            :loaded="progress?.loaded ?? 0"
            class="h-0.5 w-full"
          />
        </div>
      </template>
    </PDFMenu>
    <div class="relative flex min-h-0 min-w-0 flex-auto">
      <PDFSideBar
        v-model="viewerOptions.sidebar"
        :options="sidebarOptions"
        :outline="outline"
        :attachments="attachments"
        class="absolute inset-y-0 left-0 z-10"
        @changePage="(e) => changePage(e.page, e.offset)"
      />
      <PDFViewer
        v-if="!!pdf && !loading"
        ref="viewer"
        :pdf="pdf"
        :smoothJump="smoothJump"
        :view="viewerOptions.mode"
        :textLayer="textLayer"
        :rotation="viewerOptions.rotation"
        v-model:scale="viewerOptions.scale"
        class="max-h-full min-h-0 min-w-0 flex-auto transition-all"
        :class="{
          'md:ml-64': viewerOptions.sidebar,
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
