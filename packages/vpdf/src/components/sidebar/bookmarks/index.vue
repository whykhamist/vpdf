<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { pdfOutlinePairs, Point } from "../../../types/pdf";

const BookmarkItem = defineAsyncComponent(() => import("./bookmarkItem.vue"));

const props = defineProps<{
  outline?: Array<pdfOutlinePairs>;
}>();

const emit = defineEmits(["changePage"]);

const changePage = (page: number | null, offset: Point | null = null) => {
  if (!!page) {
    emit("changePage", { page, offset });
  }
};
</script>

<template>
  <div class="px-3 py-1">
    <div
      v-if="!outline || outline?.length <= 0"
      class="select-none text-center font-semibold italic text-gray-400/50"
    >
      No Bookmarks
    </div>
    <template v-for="outl in outline" :key="`${outl.page}_${outl.title}`">
      <BookmarkItem
        :outline="outl"
        @changePage="(e) => changePage(e.page, e.offset)"
      />
    </template>
  </div>
</template>
