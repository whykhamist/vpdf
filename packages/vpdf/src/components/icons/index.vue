<script setup lang="ts">
const props = defineProps<{
  name: string;
}>();
</script>

<template>
  <i
    class="vpdf:icon vpdf:leading-none vpdf:transition-colors"
    :class="`vpdf:icon-${name}`"
  />
</template>
