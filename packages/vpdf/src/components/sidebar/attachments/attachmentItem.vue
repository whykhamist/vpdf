<script setup lang="ts">
import { computed } from "vue";
import { pdfattachmentFile } from "../../../types/pdf";
import FocusHelper from "../../focusHelper/index.vue";
import { VueComponent as FileIcon } from "@whykhamist/file-icons";
import { getMime, getExtension } from "@whykhamist/mime-types";

const props = defineProps<{
  attachment: pdfattachmentFile;
  size: string;
}>();

const icon = computed((): string => {
  const mime = getMime(props.attachment.rawFilename);
  if (!!mime) {
    return (getExtension(mime as string) ?? "blank") as string;
  }
  return "blank";
});
</script>

<template>
  <div class="relative cursor-pointer select-none overflow-hidden px-2 py-1">
    <FocusHelper class="bg-blue-500" />
    <div class="flex items-center gap-2">
      <FileIcon :name="icon" class="text-3xl" />
      <div class="flex flex-auto flex-col justify-center gap-0.5">
        <div class="text-sm font-semibold leading-none">
          {{ attachment.filename }}
        </div>
        <div class="text-xs leading-none">
          {{ size }}
        </div>
      </div>
    </div>
  </div>
</template>
