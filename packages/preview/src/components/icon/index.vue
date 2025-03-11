<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";

const props = defineProps<{
  name: string;
}>();

const icon = defineAsyncComponent(() => import(`./svg/${props.name}.vue`));
</script>

<template>
  <component :is="icon" class="fill-current" />
</template>
