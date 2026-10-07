<script setup lang="ts">
import { VPdfOpenPlugin } from "@whykhamist/vpdf-plugin-open";
import { VPdfPrintPlugin } from "@whykhamist/vpdf-plugin-print";
import { VPdfPageLayoutPlugin } from "@whykhamist/vpdf-plugin-page-layout";
import { VPdfIconifyPlugin } from "@whykhamist/vpdf-plugin-iconify";
import { VPdfXfaThumbnailRasterPlugin } from "@whykhamist/vpdf-plugin-xfa-thumbnail-raster";
import "@whykhamist/vpdf-plugin-iconify/style.css";
import DocsViewer from "../components/DocsViewer.vue";
import { VPdfViewerOptions } from "@whykhamist/vpdf";

const options = {
  pageGap: 10,
  pageRadius: 10,
  destinationOffset: 20,
  scale: "page-fit",
} as VPdfViewerOptions;

const plugins = {
  plugins: [
    VPdfPageLayoutPlugin(),
    VPdfPrintPlugin({ dpi: 150 }),
    VPdfOpenPlugin(),
    VPdfIconifyPlugin(),
    VPdfXfaThumbnailRasterPlugin(),
  ],
  enabled: {
    "vpdf.open": true,
    "vpdf.iconify": true,
    "vpdf.xfa-thumbnail-raster": true,
  },
};
</script>

<template>
  <DocsViewer :options="options" :plugins="plugins" />
</template>
