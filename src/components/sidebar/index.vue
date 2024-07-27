<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from "vue";
import { pdfattachment, pdfOutlinePairs, Point } from "../../types/pdf";

const Button = defineAsyncComponent(() => import("../button/index.vue"));
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    options: Record<string, Object>;
    outline?: Array<pdfOutlinePairs>;
    attachments?: pdfattachment | null;
  }>(),
  {
    modelValue: false,
    options: () => ({
      thumbnails: true,
      bookmarks: true,
      attachments: true,
    }),
  }
);
const emit = defineEmits(["update:modelValue", "changePage"]);

type itemType = {
  label: string;
  icon: string;
  component: any;
  bind: Object;
  events: Object;
};

const items = computed<Record<string, itemType>>(() => {
  let result = {};
  if (!!props.options.thumbnails) {
    Object.assign(result, {
      thumbnails: {
        label: "Page Thumbnails",
        icon: "file_copy",
        component: defineAsyncComponent(() => import("./thumbnails/index.vue")),
        bind: props.options.thumbnails,
        events: {},
      },
    });
  }

  if (!!props.options.bookmarks) {
    Object.assign(result, {
      bookmarks: {
        label: "Bookmarks",
        icon: "bookmark_border",
        component: defineAsyncComponent(() => import("./bookmarks/index.vue")),
        bind: {
          outline: props.outline,
        },
        events: {
          changePage: (e: { page: number | null; offset: Point | null }) =>
            changePage(e.page, e.offset),
        },
      },
    });
  }

  if (!!props.options.attachments) {
    Object.assign(result, {
      attachments: {
        label: "Attachments",
        icon: "attachment",
        component: defineAsyncComponent(
          () => import("./attachments/index.vue")
        ),
        bind: {
          attachments: props.attachments,
        },
        events: {},
      },
    });
  }
  return result;
});

const activeItemName = ref<string>("bookmarks");
const activeItem = computed<itemType>(
  () => items.value[activeItemName.value] ?? null
);

const changePage = (page: number | null, offset: Point | null = null) => {
  if (!!page) {
    emit("changePage", { page, offset });
  }
};
</script>

<template>
  <div
    class="flex min-w-0 flex-auto flex-col overflow-hidden bg-white/75 transition-all"
    :class="{
      'w-0': !props.modelValue,
      'w-64': props.modelValue,
    }"
  >
    <div
      class="flex items-center gap-2 border-b border-r border-gray-700/25 bg-white/25"
    >
      <div class="flex flex-auto items-center gap-0.5 px-2 py-1">
        <template v-for="(item, index) in items" :key="item.label">
          <Button
            class="group w-8 rounded-lg px-1 py-0.5"
            :class="{
              'bg-gray-400/25': activeItemName === index,
            }"
            :icon="item.icon"
            :iconClass="{
              'aspect-square w-6 fill-gray-700 transition-colors ': true,
              'group-hover:fill-blue-500': activeItemName !== index,
              'fill-blue-700': activeItemName === index,
            }"
            @click="activeItemName = index"
          />
        </template>
      </div>
      <div class="flex items-center gap-0.5 px-2 py-1">
        <Button
          icon="close"
          iconClass="aspect-square w-4 fill-gray-700"
          class="rounded-full p-1"
          @click="emit('update:modelValue', false)"
        />
      </div>
    </div>
    <div class="flex-auto overflow-auto border-r border-gray-700/25">
      <component
        :is="activeItem.component"
        v-bind="activeItem.bind"
        v-on="activeItem.events"
      />
    </div>
  </div>
</template>
