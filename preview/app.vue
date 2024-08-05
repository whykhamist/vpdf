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
const theme = ref("");
</script>

<style lang="scss">
.vpdf-sepia {
  --foreground: 34 33% 20%;
  --background: 42 54% 88%;
  --primary: 34 20% 51%;
  --secondary: 60 19% 73%;
  --accent: 75 19% 63%;
}
</style>

<template>
  <div class="flex h-full flex-col px-3 py-2">
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
      <label
        for="__PDF_PREVIEW_THEME_SELECT__"
        class="rounded-lg bg-gray-400/25 px-3 py-1"
      >
        <select
          id="__PDF_PREVIEW_THEME_SELECT__"
          v-model="theme"
          class="w-full bg-transparent bg-none outline-none"
        >
          <option value="">LIght (Default)</option>
          <option value="vpdf-dark">Dark</option>
          <option value="vpdf-sepia">Sepia (Custom)</option>
        </select>
      </label>
    </div>
    <VPdf
      :src="src"
      :smoothJump="smoothJump"
      :textLayer="textLayer"
      class="min-h-0 flex-auto"
      :class="theme"
    />
  </div>
</template>
