<script setup lang="ts">
import { pdfattachmentFile } from "../../../types/pdf";
import FocusHelper from "../../focusHelper/index.vue";

const props = defineProps<{
  attachment: pdfattachmentFile;
  active: boolean;
}>();

const humanFileSize = (bytes: number, si = false, dp = 1) => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
};
</script>

<template>
  <div
    class="relative flex select-none flex-col justify-center gap-0.5 overflow-hidden p-2"
    :class="{
      'bg-blue-500 text-blue-100': active,
    }"
  >
    <FocusHelper class="bg-blue-500" />
    <div class="text-sm font-semibold leading-none">
      {{ attachment.filename }}
    </div>
    <div class="text-xs leading-none">
      {{ humanFileSize(attachment.content.length) }}
    </div>
  </div>
</template>
