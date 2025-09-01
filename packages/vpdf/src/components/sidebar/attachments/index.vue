<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import type { pdfattachment } from "../../../types/pdf";
import { getMime } from "@whykhamist/mime-types";

const AttachmentItem = defineAsyncComponent(
  () => import("./attachmentItem.vue"),
);

const props = defineProps<{
  attachments?: pdfattachment | null;
}>();

// TODO: Create multiple file selection & download feature

const downloadFile = (filename: string) => {
  const blob = binaryToBlob(
    props.attachments![filename]?.content as Uint8Array,
    getMime(filename) as string,
  );
  download(blob, filename);
};

const download = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

const binaryToBlob = (data: Uint8Array, type: string) => {
  const blob = new Blob([data as BlobPart], {
    type: type,
  });
  return blob;
};

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
  <div class="vpdf:flex vpdf:max-h-full vpdf:flex-col vpdf:gap-0.5 vpdf:py-1">
    <div class="vpdf:min-h-0 vpdf:flex-auto vpdf:overflow-auto">
      <template v-if="!attachments || Object.keys(attachments).length <= 0">
        <div
          class="vpdf:text-center vpdf:font-semibold vpdf:text-foreground-400 vpdf:italic vpdf:select-none"
        >
          No Attachments
        </div>
      </template>
      <template
        v-for="(attachment, index) in attachments"
        :key="attachment.filename"
      >
        <AttachmentItem
          :attachment="attachment"
          :size="humanFileSize(attachment.content.length)"
          @click="downloadFile(index)"
          class="vpdf:mb-0.5"
        />
      </template>
    </div>
  </div>
</template>
