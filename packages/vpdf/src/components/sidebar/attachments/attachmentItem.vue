<script setup lang="ts">
import { pdfattachmentFile } from "../../../types/pdf";
import FocusHelper from "../../focusHelper/index.vue";

const props = defineProps<{
  attachment: pdfattachmentFile;
  size: string;
}>();
</script>

<template>
  <div
    class="relative flex select-none flex-col justify-center gap-0.5 overflow-hidden px-2 py-1"
  >
    <FocusHelper class="bg-blue-500" />
    <div class="text-sm font-semibold leading-none">
      {{ attachment.filename }}
    </div>
    <div class="text-xs leading-none">
      {{ size }}
    </div>
  </div>
</template>
