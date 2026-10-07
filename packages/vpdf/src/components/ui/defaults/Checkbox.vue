<script setup lang="ts">
import { useAttrs } from "vue";

defineOptions({ inheritAttrs: false });

defineProps<{
  modelValue?: boolean;
  label?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const attrs = useAttrs();
</script>

<template>
  <label
    class="vpdf-checkbox"
    :class="attrs.class"
    :title="attrs.title as string | undefined"
  >
    <input
      v-bind="{ ...attrs, class: undefined, title: undefined }"
      type="checkbox"
      :checked="modelValue"
      @change="
        emit('update:modelValue', ($event.target as HTMLInputElement).checked)
      "
    />
    <slot>{{ label }}</slot>
  </label>
</template>
