<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { pdfattachment, pdfattachmentFile } from "../../../types/pdf";
import { getMime } from "@whykhamist/mime-types";

const AttachmentItem = defineAsyncComponent(
  () => import("./attachmentItem.vue")
);

const props = defineProps<{
  attachments?: pdfattachment | null;
}>();

// TODO: Create multiple file selection & download feature

const downloadFile = (filename: string) => {
  const blob = binaryToBlob(
    props.attachments![filename].content as Uint8Array,
    getMime(filename) as string
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
  const blob = new Blob([data], {
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
  <div class="flex max-h-full flex-col gap-0.5 py-1">
    <div class="min-h-0 flex-auto overflow-auto">
      <template v-if="!attachments || Object.keys(attachments).length <= 0">
        <div
          class="select-none text-center font-semibold italic text-gray-400/50"
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
          class="mb-0.5"
        />
      </template>
    </div>
  </div>
</template>
