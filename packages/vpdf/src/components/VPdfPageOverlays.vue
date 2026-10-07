<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { isPluginItemVisible, pluginItemProps } from '../plugins/resolve'
import type { VPdfPluginPageOverlay } from '../plugins/types'

const props = defineProps<{
  container?: HTMLElement
  overlays: VPdfPluginPageOverlay[]
}>()

const hosts = ref<Array<{ pageNumber: number; el: HTMLElement }>>([])

let observer: MutationObserver | undefined

function overlayHost(page: HTMLElement): HTMLElement {
  const existing = page.querySelector<HTMLElement>(':scope > .vpdf-page-overlays')
  if (existing) return existing
  const host = document.createElement('div')
  host.className = 'vpdf-page-overlays'
  page.appendChild(host)
  return host
}

function syncHosts() {
  const root = props.container
  if (!root) {
    hosts.value = []
    return
  }
  const pages = root.querySelectorAll<HTMLElement>('.page[data-page-number]')
  const next: Array<{ pageNumber: number; el: HTMLElement }> = []
  for (const page of pages) {
    const pageNumber = Number(page.dataset.pageNumber)
    if (!Number.isFinite(pageNumber) || pageNumber < 1) continue
    next.push({ pageNumber, el: overlayHost(page) })
  }
  hosts.value = next
}

function observe() {
  observer?.disconnect()
  if (!props.container) return
  observer = new MutationObserver(syncHosts)
  observer.observe(props.container, { childList: true, subtree: true })
  syncHosts()
}

function showsOnPage(overlay: VPdfPluginPageOverlay, pageNumber: number): boolean {
  if (!isPluginItemVisible(overlay)) return false
  if (!overlay.pageNumbers || overlay.pageNumbers.length === 0) return true
  return overlay.pageNumbers.includes(pageNumber)
}

watch(() => props.container, observe)
watch(() => props.overlays, syncHosts, { deep: true })

onMounted(observe)
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <template v-for="overlay in overlays" :key="overlay.id">
    <template v-for="host in hosts" :key="`${overlay.id}:${host.pageNumber}`">
      <Teleport
        v-if="showsOnPage(overlay, host.pageNumber)"
        :to="host.el"
      >
        <component
          :is="overlay.component"
          :page-number="host.pageNumber"
          v-bind="pluginItemProps(overlay)"
        />
      </Teleport>
    </template>
  </template>
</template>
