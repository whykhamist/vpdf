<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, useAttrs, useId } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  modelValue?: string | number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

type SelectItem = {
  value: string
  label: string
  disabled: boolean
  group?: string
}

const attrs = useAttrs()
const uid = useId()
const listboxId = `vpdf-select-${uid}`
const root = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const nativeSelect = ref<HTMLSelectElement>()
const open = ref(false)
const items = ref<SelectItem[]>([])
const activeIndex = ref(-1)

const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const disabled = computed(() => {
  const value = attrs.disabled
  return value === '' || value === true || value === 'true' || value === 'disabled'
})

const selectedValue = computed(() => String(props.modelValue ?? ''))

const selectedIndex = computed(() =>
  items.value.findIndex((item) => item.value === selectedValue.value),
)

const selectedLabel = computed(() => {
  const index = selectedIndex.value
  if (index >= 0) return items.value[index]!.label
  return items.value[0]?.label ?? ''
})

function readItems(): SelectItem[] {
  const el = nativeSelect.value
  if (!el) return []
  return Array.from(el.options, (option) => {
    const parent = option.parentElement
    return {
      value: option.value,
      label: option.label,
      disabled: option.disabled,
      group: parent instanceof HTMLOptGroupElement ? parent.label : undefined,
    }
  })
}

function sameItems(a: SelectItem[], b: SelectItem[]) {
  return (
    a.length === b.length &&
    a.every((item, index) => {
      const other = b[index]
      return (
        other !== undefined &&
        item.value === other.value &&
        item.label === other.label &&
        item.disabled === other.disabled &&
        item.group === other.group
      )
    })
  )
}

function syncItems() {
  const next = readItems()
  if (!sameItems(items.value, next)) items.value = next
}

function optionId(index: number) {
  return `${listboxId}-option-${index}`
}

function firstEnabledIndex(from: number, step: number) {
  const count = items.value.length
  if (count === 0) return -1
  let index = from
  for (let i = 0; i < count; i += 1) {
    index = (index + step + count) % count
    if (!items.value[index]?.disabled) return index
  }
  return -1
}

function moveActive(step: number) {
  const start = activeIndex.value < 0 ? (step > 0 ? -1 : 0) : activeIndex.value
  const next = firstEnabledIndex(start, step)
  if (next >= 0) activeIndex.value = next
}

function close() {
  open.value = false
}

function openList() {
  if (disabled.value) return
  const selected = selectedIndex.value
  activeIndex.value = selected >= 0 && !items.value[selected]?.disabled
    ? selected
    : firstEnabledIndex(-1, 1)
  open.value = true
}

function toggle() {
  if (open.value) close()
  else openList()
}

function choose(index: number) {
  const item = items.value[index]
  if (!item || item.disabled) return
  emit('update:modelValue', item.value)
  close()
  trigger.value?.focus()
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target as Node | null
  if (root.value && target && !root.value.contains(target)) close()
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (disabled.value) return
  if (!open.value) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openList()
    }
    return
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    close()
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveActive(1)
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveActive(-1)
    return
  }
  if (event.key === 'Home') {
    event.preventDefault()
    activeIndex.value = firstEnabledIndex(-1, 1)
    return
  }
  if (event.key === 'End') {
    event.preventDefault()
    activeIndex.value = firstEnabledIndex(items.value.length, -1)
    return
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    choose(activeIndex.value)
  }
}

onMounted(() => {
  syncItems()
  document.addEventListener('click', onDocumentClick)
})

onUpdated(syncItems)

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <span ref="root" class="vpdf-field-control vpdf-select" :class="attrs.class">
    <select
      ref="nativeSelect"
      class="vpdf-select-native"
      tabindex="-1"
      aria-hidden="true"
      :value="selectedValue"
      :disabled="disabled"
    >
      <slot />
    </select>
    <button
      ref="trigger"
      v-bind="forwarded"
      type="button"
      class="vpdf-select-trigger"
      :disabled="disabled"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-controls="listboxId"
      :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      {{ selectedLabel }}
    </button>
    <div
      v-if="open"
      :id="listboxId"
      class="vpdf-select-panel"
      role="listbox"
      @click.stop
    >
      <template v-for="(item, index) in items" :key="`${item.value}:${index}`">
        <div
          v-if="item.group && items[index - 1]?.group !== item.group"
          class="vpdf-select-group"
        >
          {{ item.group }}
        </div>
        <div
          :id="optionId(index)"
          class="vpdf-select-option"
          role="option"
          :aria-selected="item.value === selectedValue"
          :aria-disabled="item.disabled || undefined"
          :data-active="activeIndex === index || undefined"
          @mousedown.prevent="choose(index)"
        >
          {{ item.label }}
        </div>
      </template>
    </div>
  </span>
</template>
