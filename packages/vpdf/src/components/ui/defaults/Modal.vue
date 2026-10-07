<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { VPDF_MODAL_TITLE_ID, VPDF_MODAL_TITLE_ID_KEY } from '../../../types/ui'

const props = withDefaults(
  defineProps<{
    busy?: boolean
    dismissible?: boolean
    restoreFocus?: HTMLElement
  }>(),
  {
    dismissible: true,
  },
)

const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLElement>()

provide(VPDF_MODAL_TITLE_ID_KEY, VPDF_MODAL_TITLE_ID)

function focusables(): HTMLElement[] {
  const root = dialogRef.value
  if (!root) return []
  return [...root.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )]
}

function close() {
  emit('close')
}

function onBackdropClick() {
  if (props.dismissible) close()
}

function onKeydown(event: KeyboardEvent) {
  event.stopPropagation()
  if (event.key === 'Escape') {
    event.preventDefault()
    if (props.dismissible) close()
    return
  }
  if (event.key !== 'Tab') return
  const items = focusables()
  if (items.length === 0) {
    event.preventDefault()
    dialogRef.value?.focus()
    return
  }
  const first = items[0]!
  const last = items[items.length - 1]!
  const active = document.activeElement
  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

async function focusFirst() {
  await nextTick()
  const first = focusables()[0]
  ;(first ?? dialogRef.value)?.focus()
}

onMounted(() => {
  void focusFirst()
})

watch(
  () => props.busy,
  () => {
    void focusFirst()
  },
)

onBeforeUnmount(() => {
  const restore = props.restoreFocus
  if (restore && restore.isConnected) restore.focus()
})
</script>

<template>
  <div
    class="vpdf-dialog-backdrop"
    role="presentation"
    @click.self="onBackdropClick"
    @keydown="onKeydown"
  >
    <div
      ref="dialogRef"
      class="vpdf-dialog"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="VPDF_MODAL_TITLE_ID"
      aria-label="Dialog"
      :aria-busy="busy ? true : undefined"
      tabindex="-1"
    >
      <slot />
    </div>
  </div>
</template>
