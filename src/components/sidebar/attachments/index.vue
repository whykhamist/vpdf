<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { pdfattachment } from "../../../types/pdf";

const Button = defineAsyncComponent(() => import("../../button/index.vue"));
const AttachmentItem = defineAsyncComponent(
  () => import("./attachmentItem.vue")
);

const props = defineProps<{
  attachments?: pdfattachment | null;
}>();

const selected = ref<Array<string>>([]);

const selectFile = (file: string) => {
  if (isSelected(file)) {
    selected.value = selected.value?.filter((f) => f !== file);
  } else {
    selected.value.push(file);
  }
};

const isSelected = (file: string) => {
  return !!selected.value?.includes(file);
};

const downloadFiles = () => {};

const binaryToBlob = (data: Uint8Array, type: string) => {
  const blob = new Blob([data], {
    type: type,
  });
  return blob;
};
</script>

<template>
  <div class="flex max-h-full flex-col gap-0.5">
    <div
      class="flex items-center justify-end gap-2 border-b border-gray-400/25 px-2 py-1"
    >
      <Button
        label="Download"
        class="rounded-lg border border-gray-400/25 bg-blue-600 px-3 py-1 text-white disabled:bg-gray-400/25 disabled:text-gray-400"
        :disabled="selected.length <= 0"
        @click="downloadFiles"
      />
    </div>
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
          :active="isSelected(index)"
          @click="selectFile(index)"
          class="mb-0.5"
        />
      </template>
    </div>
  </div>
</template>
