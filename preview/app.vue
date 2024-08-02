<script setup lang="ts">
import { ref } from "vue";

import pdf from "@files/attachments.pdf";

const onlineSrc =
  "https://raw.githubusercontent.com/whykhamist/vpdf/main/preview/files/acrobat_reference.pdf";
const onlineSrcSecured =
  "https://raw.githubusercontent.com/whykhamist/vpdf/main/preview/files/acrobat_reference_secured.pdf";

const src = ref(pdf);
// const src = ref({ url: pdf, enableXfa: true }); // xfa enabled
const smoothJump = ref(false);
const textLayer = ref(false);
</script>

<style>
html,
body,
div#app,
.h-screen {
  height: 100vh;
  height: 100dvh;
  height: 100svh;
  margin: 0;
}
</style>

<template>
  <div class="flex h-full flex-col bg-rose-700 px-3 py-2">
    <div class="flex items-center gap-2 px-3 py-1">
      <label
        for="__PDF_PREVIEW_SMOOTHJ__"
        class="flex items-center gap-1 leading-none"
      >
        <input
          id="__PDF_PREVIEW_SMOOTHJ__"
          type="checkbox"
          v-model="smoothJump"
          class="leading-none"
        />
        <span class="leading-none">Smooth Jump</span>
      </label>
      <label
        for="__PDF_PREVIEW_TEXTL__"
        class="flex items-center gap-1 leading-none"
      >
        <input
          id="__PDF_PREVIEW_TEXTL__"
          type="checkbox"
          v-model="textLayer"
          class="leading-none"
        />
        <span class="leading-none">Text Layer</span>
      </label>
      <label
        for="__PDF_PREVIEW_SRC_SELECT__"
        class="w-32 rounded-lg bg-gray-400/25 px-3 py-1"
      >
        <select
          id="__PDF_PREVIEW_SRC_SELECT__"
          v-model="src"
          class="w-full bg-transparent bg-none outline-none"
        >
          <option :value="pdf">Local</option>
          <option :value="onlineSrc">Online</option>
          <option :value="onlineSrcSecured">Online Secured (password)</option>
        </select>
      </label>
    </div>
    <VPdf
      :src="src"
      :smoothJump="smoothJump"
      :textLayer="textLayer"
      class="min-h-0 flex-auto border border-gray-400"
    />
  </div>
</template>
