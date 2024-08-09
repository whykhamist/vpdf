<script setup lang="ts">
const props = defineProps<{
  name: string;
}>();
</script>

<template>
  <i class="icon leading-none transition-colors" :class="`icon-${name}`" />
</template>
