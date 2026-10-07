<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'ghost' | 'outline' | 'solid'
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'ghost',
    type: 'button',
  },
)
</script>

<template>
  <button
    :type="type"
    class="vpdf-btn"
    :class="{
      'vpdf-btn-ghost': variant === 'outline',
      'vpdf-btn-primary': variant === 'solid',
    }"
  >
    <slot />
  </button>
</template>
