<script setup lang="ts">
const props = defineProps<{
  name: string;
}>();
</script>

<template>
  <span class="icon leading-none transition-colors" :class="`icon-${name}`" />
</template>
