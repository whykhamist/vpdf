<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";

import {
  VPdfViewer,
  type VPdfSource,
  type VPdfViewerOptions,
} from "@whykhamist/vpdf";
import {
  VPdfOpenPlugin,
  VPDF_OPEN_PLUGIN_ID,
} from "@whykhamist/vpdf-plugin-open";
import {
  VPdfIconifyPlugin,
  VPDF_ICONIFY_PLUGIN_ID,
} from "@whykhamist/vpdf-plugin-iconify";
import { VPdfPageLayoutPlugin } from "@whykhamist/vpdf-plugin-page-layout";
import { VPdfPrintPlugin } from "@whykhamist/vpdf-plugin-print";
import {
  VPdfXfaThumbnailRasterPlugin,
  VPDF_XFA_THUMBNAIL_RASTER_PLUGIN_ID,
} from "@whykhamist/vpdf-plugin-xfa-thumbnail-raster";

import { VPdfDemoPlugin } from "./plugins/demoPlugin";
import { RoundedHighlighter } from "./plugins/roundedHighlighter";

const DEMO_URL =
  "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";

const src = shallowRef<VPdfSource>(DEMO_URL);

const fileInput = ref<HTMLInputElement>();

const theme = ref("vpdf-light");
const themes = [
  { label: "Light", value: "vpdf-light" },
  { label: "Light (rich)", value: "vpdf-light-rich" },
  { label: "Dark", value: "vpdf-dark" },
  { label: "Sepia", value: "vpdf-sepia" },
  { label: "Sepia (rich)", value: "vpdf-sepia-rich" },
  { label: "Sepia (dark)", value: "vpdf-sepia-dark" },
  { label: "Slate", value: "vpdf-slate" },
  { label: "Slate (rich)", value: "vpdf-slate-rich" },
  { label: "Slate (dark)", value: "vpdf-slate-dark" },
  { label: "Ocean", value: "vpdf-ocean" },
  { label: "Ocean (rich)", value: "vpdf-ocean-rich" },
  { label: "Ocean (dark)", value: "vpdf-ocean-dark" },
  { label: "Forest", value: "vpdf-forest" },
  { label: "Forest (rich)", value: "vpdf-forest-rich" },
  { label: "Forest (dark)", value: "vpdf-forest-dark" },
  { label: "Rose", value: "vpdf-rose" },
  { label: "Rose (rich)", value: "vpdf-rose-rich" },
  { label: "Rose (dark)", value: "vpdf-rose-dark" },
  { label: "Amber", value: "vpdf-amber" },
  { label: "Amber (rich)", value: "vpdf-amber-rich" },
  { label: "Amber (dark)", value: "vpdf-amber-dark" },
];

const smoothJump = ref(true);
const pageGap = ref<number | undefined>(10);
const pageRadius = ref(10);
const destinationOffset = ref(20);
const thumbnailColumns = ref(2);
const textLayer = ref(true);
const annotations = ref(true);
const xfa = ref(true);

const message = ref("Ready");

const options = computed<VPdfViewerOptions>(() => ({
  smoothJump: smoothJump.value,
  pageGap: pageGap.value,
  pageRadius: pageRadius.value,
  destinationOffset: destinationOffset.value,
  thumbnailColumns: thumbnailColumns.value,
  scale: "page-fit",
  features: {
    textLayer: textLayer.value,
    annotations: annotations.value,
    xfa: xfa.value,
    search: true,
    thumbnails: true,
    outline: true,
    attachments: true,
    scripting: false,
  },
  assets: {
    workerSrc: new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString(),
    cMapUrl: new URL("pdfjs-dist/cmaps/", import.meta.url).toString(),
    standardFontDataUrl: new URL(
      "pdfjs-dist/standard_fonts/",
      import.meta.url,
    ).toString(),
    wasmUrl: new URL("pdfjs-dist/wasm/", import.meta.url).toString(),
  },
}));

const plugins = {
  plugins: [
    VPdfDemoPlugin(),
    VPdfPageLayoutPlugin(),
    VPdfPrintPlugin({ dpi: 72, title: "Test" }),
    VPdfXfaThumbnailRasterPlugin(),
    VPdfOpenPlugin(),
    VPdfIconifyPlugin(),
    RoundedHighlighter(),
  ],
  enabled: {
    //   "demo-marks": true,
    //   "page-layout": true,
    //   "vpdf.print": true,
    // [VPDF_XFA_THUMBNAIL_RASTER_PLUGIN_ID]: false,
    [VPDF_OPEN_PLUGIN_ID]: false,
    [VPDF_ICONIFY_PLUGIN_ID]: true,
    // [VPDF_BUILTIN_PLUGIN_IDS.navigation]: false,
  },
};

const viewerRef = ref<{
  controller: import("@whykhamist/vpdf").VPdfViewerController;
} | null>(null);

function loadUrl() {
  message.value = "Loading remote demo PDF";
  void viewerRef.value?.controller.load(DEMO_URL);

  // viewerRef.value?.controller.;
}

function onFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;
  src.value = file;
  message.value = `Loaded file: ${file.name}`;
}

function onBlob() {
  void fetch(DEMO_URL)
    .then((res) => res.blob())
    .then((blob) => {
      src.value = blob;
      message.value = "Loaded as Blob";
    });
}
</script>

<template>
  <div class="grid h-full grid-rows-[auto_1fr] gap-4 p-4">
    <header class="grid gap-3">
      <div>
        <p
          class="m-0 text-xs font-bold tracking-widest text-blue-600 uppercase"
        >
          @whykhamist/vpdf
        </p>

        <h1 class="my-0.5 text-[clamp(1.75rem,3vw,2.4rem)]">Playground</h1>

        <p class="m-0 max-w-2xl text-slate-600">
          Drop-in Vue 3 PDF viewer with built-in plugins, opt-in open, page
          layout, print, Iconify, and XFA thumbnail raster packages, and
          Tailwind theming.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="min-h-11 cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5"
          @click="loadUrl"
        >
          Remote URL
        </button>

        <button
          type="button"
          class="min-h-11 cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5"
          @click="fileInput?.click()"
        >
          Open File
        </button>

        <button
          type="button"
          class="min-h-11 cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5"
          @click="onBlob"
        >
          Load Blob
        </button>

        <input
          ref="fileInput"
          type="file"
          accept="application/pdf"
          hidden
          @change="onFile"
        />

        <label class="inline-flex min-h-11 items-center gap-1.5">
          Theme
          <select
            v-model="theme"
            class="min-h-11 cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5"
          >
            <template v-for="t in themes" :key="t.value">
              <option :value="t.value">{{ t.label }}</option>
            </template>
          </select>
        </label>

        <label class="inline-flex min-h-11 items-center gap-1.5">
          <input v-model="smoothJump" type="checkbox" /> Smooth Jump
        </label>

        <label class="inline-flex min-h-11 items-center gap-1.5">
          Page gap
          <input
            v-model.number="pageGap"
            type="number"
            min="0"
            placeholder="default"
            class="min-h-11 w-20 cursor-text rounded-lg border border-slate-300 bg-white px-2"
          />
        </label>

        <label class="inline-flex min-h-11 items-center gap-1.5">
          Page radius
          <input
            v-model.number="pageRadius"
            type="number"
            min="0"
            class="min-h-11 w-20 cursor-text rounded-lg border border-slate-300 bg-white px-2"
          />
        </label>

        <label class="inline-flex min-h-11 items-center gap-1.5">
          Dest offset
          <input
            v-model.number="destinationOffset"
            type="number"
            min="0"
            class="min-h-11 w-20 cursor-text rounded-lg border border-slate-300 bg-white px-2"
          />
        </label>

        <label class="inline-flex min-h-11 items-center gap-1.5">
          <input v-model="textLayer" type="checkbox" /> Text layer
        </label>

        <label class="inline-flex min-h-11 items-center gap-1.5">
          <input v-model="annotations" type="checkbox" /> Annotations
        </label>

        <label class="inline-flex min-h-11 items-center gap-1.5">
          <input v-model="xfa" type="checkbox" /> XFA
        </label>
      </div>

      <p class="m-0 text-slate-500" role="status">{{ message }}</p>
    </header>

    <main class="min-h-[80vh] py-5">
      <VPdfViewer
        ref="viewerRef"
        :src="src"
        :options="options"
        :plugins="plugins"
        :class="theme"
        @ready="message = 'Document ready'"
        @error="(err) => (message = err.message)"
      />
    </main>
    <footer class="min-h-screen"></footer>
  </div>
</template>
