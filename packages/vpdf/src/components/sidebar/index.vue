<script setup lang="ts">
import { ref, computed } from "vue";
import type { pdfattachment, pdfOutlinePairs, Point } from "../../types/pdf";
import type { PDFDocumentLoadingTask } from "pdfjs-dist/types/src/display/api";

import Button from "../button/index.vue";
import Thumbnails from "./thumbnails/index.vue";
import Bookmarks from "./bookmarks/index.vue";
import Attachments from "./attachments/index.vue";
import Wrapper from "./wrapper.vue";

const props = withDefaults(
  defineProps<{
    options: Record<string, boolean>;
    outline?: Array<pdfOutlinePairs>;
    attachments?: pdfattachment | null;
    pdf: PDFDocumentLoadingTask | undefined;
    page: number;
    rotation: number;
  }>(),
  {
    options: () => ({
      thumbnails: true,
      bookmarks: true,
      attachments: true,
    }),
    page: 1,
    rotation: 0,
  },
);
const emit = defineEmits(["changePage"]);

const expanded = defineModel<boolean>();

type itemType = {
  label: string;
  icon: string;
  component: any;
  bind: Record<string, any>;
  events: Record<string, any>;
};
type IPage = {
  page: number;
  offset: Point | null;
};

const items = computed<Record<string, itemType>>(() => {
  let result = {};
  if (props.options.thumbnails) {
    Object.assign(result, {
      thumbnails: {
        label: "Page Thumbnails",
        icon: "file_copy",
      },
    });
  }

  if (props.options.bookmarks) {
    Object.assign(result, {
      bookmarks: {
        label: "Bookmarks",
        icon: "bookmark_border",
      },
    });
  }

  if (props.options.attachments) {
    Object.assign(result, {
      attachments: {
        label: "Attachments",
        icon: "attachment",
      },
    });
  }
  return result;
});

const activeItemName = ref<string>("bookmarks");

const changePage = (e: IPage) => {
  if (e) {
    emit("changePage", { page: e.page, offset: e.offset } as IPage);
  }
};
</script>

<template>
  <Wrapper v-model="expanded">
    <div
      v-if="expanded"
      class="vpdf:flex vpdf:items-center vpdf:gap-2 vpdf:border-r vpdf:border-b vpdf:border-accent/25"
    >
      <div
        class="vpdf:flex vpdf:flex-auto vpdf:items-center vpdf:gap-0.5 vpdf:px-2 vpdf:py-1"
      >
        <template v-for="(item, index) in items" :key="item.label">
          <Button
            :icon="item.icon"
            :class="{
              'vpdf:bg-secondary/30': activeItemName === index,
              'vpdf:hover:text-primary': activeItemName !== index,
            }"
            @click="activeItemName = index"
          />
        </template>
      </div>
      <div class="vpdf:flex vpdf:items-center vpdf:gap-0.5 vpdf:px-2 vpdf:py-1">
        <Button
          icon="close"
          class="vpdf:rounded-full vpdf:p-1"
          @click="expanded = false"
        />
      </div>
    </div>
    <div
      v-if="modelValue"
      class="vpdf:flex-auto vpdf:overflow-auto vpdf:border-r vpdf:border-gray-700/25"
    >
      <Thumbnails
        v-if="!!options.thumbnails && activeItemName == 'thumbnails' && !!pdf"
        :pdf="pdf"
        :page="page"
        :rotation="rotation"
        class="vpdf:overflow-x-hidden"
        @changePage="changePage"
      />
      <Bookmarks
        v-if="activeItemName == 'bookmarks'"
        :outline="outline"
        @changePage="changePage"
      />
      <Attachments
        v-if="activeItemName == 'attachments'"
        :attachments="attachments"
      />
    </div>
  </Wrapper>
</template>
