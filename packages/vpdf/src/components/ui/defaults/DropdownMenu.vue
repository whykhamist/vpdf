<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const open = defineModel<boolean>('open', { default: false })
const root = ref<HTMLElement>()

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target as Node | null
  if (root.value && target && !root.value.contains(target)) close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !open.value) return
  event.preventDefault()
  event.stopPropagation()
  close()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div ref="root" class="vpdf-dropdown" @keydown="onKeydown">
    <slot :open="open" :toggle="toggle" :close="close" />
    <div
      v-if="open"
      class="vpdf-dropdown-panel"
      @click.stop
    >
      <slot name="content" :close="close" />
    </div>
  </div>
</template>
