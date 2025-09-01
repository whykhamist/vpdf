<script setup lang="ts">
import { computed } from "vue";
import type { pdfattachmentFile } from "../../../types/pdf";
import FocusHelper from "../../focusHelper/index.vue";
import { VueComponent as FileIcon } from "@whykhamist/file-icons";
import { getMime, getExtension } from "@whykhamist/mime-types";

const props = defineProps<{
  attachment: pdfattachmentFile;
  size: string;
}>();

const icon = computed((): string => {
  const mime = getMime(props.attachment.rawFilename);
  if (mime) {
    return (getExtension(mime as string) ?? "blank") as string;
  }
  return "blank";
});
</script>

<template>
  <div
    class="vpdf:relative vpdf:cursor-pointer vpdf:overflow-hidden vpdf:px-2 vpdf:py-1 vpdf:select-none"
  >
    <FocusHelper class="vpdf:bg-primary-500" />
    <div class="vpdf:flex vpdf:items-center vpdf:gap-2">
      <FileIcon :name="icon" class="vpdf:text-3xl" />
      <div
        class="vpdf:flex vpdf:flex-auto vpdf:flex-col vpdf:justify-center vpdf:gap-0.5"
      >
        <div class="vpdf:text-sm vpdf:leading-none vpdf:font-semibold">
          {{ attachment.filename }}
        </div>
        <div class="vpdf:text-xs vpdf:leading-none">
          {{ size }}
        </div>
      </div>
    </div>
  </div>
</template>
