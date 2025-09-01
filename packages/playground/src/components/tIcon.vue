<script setup lang="ts">
import type { MaterialIcon } from "material-icons";

const props = defineProps<{
  name: MaterialIcon;
}>();
</script>

<template>
  <i class="material-icons-outlined vpdf:leading-none">{{ name }}</i>
</template>
