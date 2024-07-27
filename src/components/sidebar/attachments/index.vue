<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { pdfattachment, pdfattachmentFile } from "../../../types/pdf";

const AttachmentItem = defineAsyncComponent(
  () => import("./attachmentItem.vue")
);

const props = defineProps<{
  attachments?: pdfattachment | null;
}>();

const selected = ref<Array<pdfattachmentFile>>([]);

const selectFile = (file: pdfattachmentFile) => {
  if (isSelected(file)) {
    selected.value = selected.value?.filter((f) => f !== file);
  } else {
    selected.value.push(file);
  }
};

const isSelected = (file: pdfattachmentFile) => {
  return !!selected.value?.includes(file);
};
</script>

<template>
  <div class="flex flex-col gap-1">
    <template v-for="attachment in attachments" :key="attachment.filename">
      <AttachmentItem
        :attachment="attachment"
        :active="isSelected(attachment)"
        @click="selectFile(attachment)"
      />
    </template>
  </div>
</template>
