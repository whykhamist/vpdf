<script setup lang="ts">
const props = defineProps<{
  label?: string;
}>();

const model = defineModel<boolean>();

const id = uniqid();
</script>

<template>
  <label
    :for="id"
    class="vpdf:flex vpdf:cursor-pointer vpdf:items-center vpdf:gap-2 vpdf:select-none"
  >
    <input :id type="checkbox" v-model="model" class="vpdf:hidden" />
    <TIcon
      :name="model ? 'check_box' : 'check_box_outline_blank'"
      class="vpdf:text-sm"
    />
    <span v-if="label" class="vpdf:leading-none vpdf:uppercase">
      {{ label }}
    </span>
  </label>
</template>
