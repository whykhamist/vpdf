<script setup lang="ts">
import { useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

defineProps<{
  modelValue?: string | number
  invalid?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const attrs = useAttrs()
</script>

<template>
  <span
    class="vpdf-field-control"
    :class="[attrs.class, { 'vpdf-field-control-invalid': invalid }]"
  >
    <input
      v-bind="{ ...attrs, class: undefined }"
      :value="modelValue"
      :aria-invalid="invalid || undefined"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </span>
</template>
