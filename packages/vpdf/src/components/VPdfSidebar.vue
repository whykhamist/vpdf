<script setup lang="ts">
import { computed, onBeforeUnmount, toValue, watch, type Component } from 'vue'
import type { VPdfSidebarPanel } from '../types'
import type { VPdfViewerApi } from '../composables/useVPdfViewer'
import { isPluginItemVisible, pluginItemProps } from '../plugins/resolve'
import type { VPdfPluginPanel } from '../plugins/types'
import VPdfIcon from './VPdfIcon.vue'

const props = defineProps<{
  api: VPdfViewerApi
}>()

const state = props.api.state

const visiblePanels = computed(() =>
  props.api.plugins.panelsView.value.filter(isPluginItemVisible),
)

const open = computed(
  () => state.value.sidebar !== 'none' && visiblePanels.value.length > 0,
)

function legacyPanelKind(panelId: string): Exclude<VPdfSidebarPanel, 'none' | 'plugins'> | undefined {
  if (panelId === 'thumbnails' || panelId.endsWith(':thumbnails')) return 'thumbnails'
  if (panelId === 'outline' || panelId.endsWith(':outline')) return 'outline'
  if (panelId === 'attachments' || panelId.endsWith(':attachments')) return 'attachments'
  return undefined
}

function panelForLegacy(kind: string): VPdfPluginPanel | undefined {
  return visiblePanels.value.find((panel) => legacyPanelKind(panel.id) === kind)
}

const activePanel = computed(() => {
  if (state.value.sidebar === 'none') return undefined
  if (state.value.sidebar === 'plugins') {
    const selected = props.api.plugins.selectedPanelId.value
    return visiblePanels.value.find((panel) => panel.id === selected) ?? visiblePanels.value[0]
  }
  return panelForLegacy(state.value.sidebar) ?? visiblePanels.value[0]
})

function selectTab(panel: VPdfPluginPanel) {
  const legacy = legacyPanelKind(panel.id)
  props.api.plugins.selectPanel(panel.id)
  props.api.controller.setSidebar(legacy ?? 'plugins')
}

function close() {
  props.api.controller.setSidebar('none')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  event.preventDefault()
  close()
}

watch(open, (isOpen) => {
  if (isOpen) {
    window.addEventListener('keydown', onKeydown)
    return
  }
  window.removeEventListener('keydown', onKeydown)
}, { immediate: true })

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

function panelIcon(panel: VPdfPluginPanel): Component | string | undefined {
  return toValue(panel.icon)
}
</script>

<template>
  <Transition name="vpdf-sidebar">
    <div
      v-if="open"
      class="vpdf-sidebar-shell"
    >
      <div
        class="vpdf-sidebar-backdrop"
        aria-hidden="true"
        @click="close"
      />
      <aside
        class="vpdf-sidebar"
        aria-label="Document sidebar"
      >
        <div class="vpdf-sidebar-tabs" role="tablist" aria-label="Sidebar panels">
          <button
            v-for="panel in visiblePanels"
            :key="panel.id"
            type="button"
            role="tab"
            class="vpdf-sidebar-tab"
            :aria-selected="activePanel?.id === panel.id"
            @click="selectTab(panel)"
          >
            <component
              :is="panelIcon(panel)"
              v-if="panelIcon(panel) && typeof panelIcon(panel) !== 'string'"
            />
            <VPdfIcon
              v-else-if="typeof panelIcon(panel) === 'string'"
              :name="String(panelIcon(panel))"
            />
            {{ panel.label }}
          </button>
        </div>

        <div class="vpdf-sidebar-body">
          <div
            v-if="activePanel"
            role="tabpanel"
            class="vpdf-plugin-panel"
            :aria-label="activePanel.title ?? activePanel.label"
          >
            <component
              :is="activePanel.component"
              v-bind="pluginItemProps(activePanel)"
            />
          </div>
        </div>
      </aside>
    </div>
  </Transition>
</template>
