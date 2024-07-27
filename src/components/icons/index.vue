<script setup lang="ts">
import { defineAsyncComponent, computed } from "vue";
const props = defineProps<{
  name: string;
}>();

const icons = [
  "arrow_circle_down",
  "arrow_circle_up",
  "help",
  "close",
  "warning",
  "error",
  "table_rows",
  "view_column",
  "zoom_in",
  "zoom_out",
  "menu",
  "menu_open",
  "file_copy",
  "attachment",
  "bookmark_border",
  "arrow_right",
  "rotate_90_degrees_ccw",
];

const iconName = computed(() =>
  icons.includes(props.name) ? props.name : "help"
);

const icon = computed(() =>
  defineAsyncComponent(() => import(`./svg/${iconName.value}.vue`))
);
</script>

<template>
  <component :is="icon" />
</template>
