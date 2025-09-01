<script setup lang="ts">
const props = defineProps<{
  options: SelectOptions;
  label?: string;
}>();

// prettier-ignore
const model = defineModel<typeof props.options[number]["value"]>();

const id = uniqid();
</script>

<template>
  <label :for="id">
    <span
      v-if="label"
      class="block mb-2 text-sm font-medium text-background-900 dark:text-foreground"
    >
      {{ label }}
    </span>
    <select
      :id
      v-model="model"
      class="vpdf:block vpdf:w-full vpdf:rounded-lg vpdf:border vpdf:border-background-300 vpdf:bg-background-50 vpdf:p-2.5 vpdf:text-sm vpdf:text-foreground-900 vpdf:focus:border-primary-500 vpdf:focus:ring-primary-500"
    >
      <template
        v-for="opt in options"
        :key="`option_${opt.label.replace(' ', '_')}`"
      >
        <option :value="opt.value">{{ opt.label }}</option>
      </template>
    </select>
  </label>
</template>
