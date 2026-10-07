<script setup lang="ts">
import { computed, defineComponent, h, ref, toValue, watch, type Component } from 'vue'
import type { VPdfViewerApi } from '../composables/useVPdfViewer'
import { isPluginItemVisible, pluginItemProps, resolvePluginFlag } from '../plugins/resolve'
import type {
  VPdfPluginMenuItem,
  VPdfPluginToolbarActionItem,
  VPdfPluginToolbarControlItem,
  VPdfPluginToolbarItem,
  VPdfPluginToolbarPlacement,
} from '../plugins/types'
import { VPDF_ICON_SLOTS } from '../icons'
import { toolbarItemOverflows } from '../utils/toolbarOverflow'
import VPdfIcon from './VPdfIcon.vue'
import { VPdfButton, VPdfDropdownMenu } from './ui'

const ActionGlyph = defineComponent({
  name: 'VPdfActionGlyph',
  props: {
    icon: { type: [Object, Function, String], default: undefined },
    fallback: { type: String, default: undefined },
  },
  setup(props) {
    return () => {
      const icon = props.icon as Component | string | undefined
      if (!icon) return null
      if (typeof icon !== 'string') return h(icon)
      return h(VPdfIcon, {
        name: icon,
        ...(typeof props.fallback === 'string' ? { fallback: props.fallback } : {}),
      })
    }
  },
})

const props = defineProps<{
  api: VPdfViewerApi
}>()

const toolbar = computed(() => props.api.resolvedToolbar.value)
const toolbarRef = ref<HTMLElement>()
const overflowOpen = ref(false)
const viewerWidth = ref(Number.POSITIVE_INFINITY)

const pluginItems = computed(() =>
  props.api.plugins.toolbarItemsView.value.filter(isPluginItemVisible),
)

const menuItems = computed(() =>
  props.api.plugins.menuItemsView.value.filter(isPluginItemVisible),
)

function itemsFor(...placements: VPdfPluginToolbarPlacement[]) {
  return pluginItems.value.filter((item) => {
    const placement = item.placement ?? 'end'
    return placements.includes(placement)
  })
}

const startItems = computed(() => itemsFor('start'))
const centerItems = computed(() => itemsFor('center'))
const endItems = computed(() => itemsFor('end', 'annotations'))
const visibleCenterItems = computed(() =>
  centerItems.value.filter((item) => !toolbarItemOverflows(item, viewerWidth.value)),
)
const visibleEndItems = computed(() =>
  endItems.value.filter((item) => !toolbarItemOverflows(item, viewerWidth.value)),
)
const overflowedItems = computed(() =>
  [...centerItems.value, ...endItems.value].filter((item) =>
    toolbarItemOverflows(item, viewerWidth.value),
  ),
)
const overflowToolbarItems = computed(() => itemsFor('overflow'))
const hasExplicitOverflow = computed(
  () => overflowToolbarItems.value.length > 0 || menuItems.value.length > 0,
)
const hasOverflow = computed(
  () => hasExplicitOverflow.value || overflowedItems.value.length > 0,
)

function isToolbarControl(item: VPdfPluginToolbarItem): item is VPdfPluginToolbarControlItem {
  return item.kind === 'control'
}

function isActionItem(item: VPdfPluginToolbarItem): item is VPdfPluginToolbarActionItem {
  return item.kind !== 'control'
}

function actionTitle(item: VPdfPluginToolbarItem): string {
  if (isToolbarControl(item)) return ''
  return String(toValue(item.title) ?? item.label)
}

function resolvedIcon(
  item: VPdfPluginToolbarActionItem | VPdfPluginMenuItem,
): Component | string | undefined {
  return toValue(item.icon)
}

function closeOverflow() {
  overflowOpen.value = false
}

watch(
  toolbarRef,
  (el, _prev, onCleanup) => {
    if (!el || typeof ResizeObserver === 'undefined') return
    const root = el.closest('.vpdf-root')
    if (!root) return
    const observer = new ResizeObserver((entries) => {
      viewerWidth.value = entries[0]?.contentRect.width ?? Number.POSITIVE_INFINITY
    })
    observer.observe(root)
    onCleanup(() => observer.disconnect())
  },
  { flush: 'post' },
)

watch(hasOverflow, (open) => {
  if (!open) overflowOpen.value = false
})

async function runMenuItem(item: VPdfPluginMenuItem) {
  if (resolvePluginFlag(item.disabled)) return
  closeOverflow()
  await item.onClick()
}
</script>

<template>
  <div
    v-if="toolbar"
    ref="toolbarRef"
    class="vpdf-toolbar"
    role="toolbar"
    aria-label="PDF toolbar"
  >
    <div class="vpdf-toolbar-group">
      <template v-for="item in startItems" :key="item.id">
        <component
          :is="item.component"
          v-if="isToolbarControl(item)"
          v-bind="pluginItemProps(item)"
        />
        <VPdfButton
          v-else-if="isActionItem(item)"
          :title="actionTitle(item)"
          :aria-label="actionTitle(item)"
          :aria-pressed="resolvePluginFlag(item.active)"
          :disabled="resolvePluginFlag(item.disabled)"
          @click="item.onClick()"
        >
          <ActionGlyph v-if="resolvedIcon(item)" :icon="resolvedIcon(item)" />
          <template v-else>{{ item.label }}</template>
        </VPdfButton>
      </template>
    </div>

    <div v-if="visibleCenterItems.length" class="vpdf-toolbar-group">
      <template v-for="item in visibleCenterItems" :key="item.id">
        <component
          :is="item.component"
          v-if="isToolbarControl(item)"
          v-bind="pluginItemProps(item)"
        />
        <VPdfButton
          v-else-if="isActionItem(item)"
          :title="actionTitle(item)"
          :aria-label="actionTitle(item)"
          :aria-pressed="resolvePluginFlag(item.active)"
          :disabled="resolvePluginFlag(item.disabled)"
          @click="item.onClick()"
        >
          <ActionGlyph v-if="resolvedIcon(item)" :icon="resolvedIcon(item)" />
          <template v-else>{{ item.label }}</template>
        </VPdfButton>
      </template>
    </div>

    <div class="vpdf-toolbar-group-end">
      <div v-if="visibleEndItems.length" class="vpdf-toolbar-end-actions">
        <template v-for="item in visibleEndItems" :key="item.id">
          <component
            :is="item.component"
            v-if="isToolbarControl(item)"
            v-bind="pluginItemProps(item)"
          />
          <VPdfButton
            v-else-if="isActionItem(item)"
            :title="actionTitle(item)"
            :aria-label="actionTitle(item)"
            :aria-pressed="resolvePluginFlag(item.active)"
            :disabled="resolvePluginFlag(item.disabled)"
            @click="item.onClick()"
          >
            <ActionGlyph v-if="resolvedIcon(item)" :icon="resolvedIcon(item)" />
            <template v-else>{{ item.label }}</template>
          </VPdfButton>
        </template>
      </div>

      <VPdfDropdownMenu
        v-if="hasOverflow"
        v-model:open="overflowOpen"
        class="vpdf-overflow"
      >
        <template #default="{ toggle, open }">
          <VPdfButton
            title="More actions"
            aria-label="More actions"
            aria-haspopup="menu"
            :aria-expanded="open"
            @click.stop="toggle"
          >
            <VPdfIcon :name="VPDF_ICON_SLOTS.more" />
          </VPdfButton>
        </template>
        <template #content="{ close }">
          <div role="menu" aria-label="More actions">
            <div v-if="overflowedItems.length" class="vpdf-toolbar-compact-only">
              <template v-for="item in overflowedItems" :key="item.id">
                <div
                  v-if="isToolbarControl(item)"
                  class="vpdf-overflow-control"
                >
                  <component
                    :is="item.component"
                    v-bind="pluginItemProps(item)"
                  />
                </div>
                <button
                  v-else-if="isActionItem(item)"
                  type="button"
                  class="vpdf-overflow-item"
                  role="menuitem"
                  :disabled="resolvePluginFlag(item.disabled)"
                  :aria-pressed="resolvePluginFlag(item.active)"
                  @click="item.onClick(); close()"
                >
                  <ActionGlyph
                    v-if="resolvedIcon(item)"
                    :icon="resolvedIcon(item)"
                  />
                  {{ item.label }}
                </button>
              </template>
            </div>
            <template v-for="item in overflowToolbarItems" :key="item.id">
              <component
                :is="item.component"
                v-if="isToolbarControl(item)"
                v-bind="pluginItemProps(item)"
              />
              <button
                v-else-if="isActionItem(item)"
                type="button"
                class="vpdf-overflow-item"
                role="menuitem"
                :disabled="resolvePluginFlag(item.disabled)"
                @click="item.onClick(); close()"
              >
                <ActionGlyph
                  v-if="resolvedIcon(item)"
                  :icon="resolvedIcon(item)"
                />
                {{ item.label }}
              </button>
            </template>
            <button
              v-for="item in menuItems"
              :key="item.id"
              type="button"
              class="vpdf-overflow-item"
              role="menuitem"
              :disabled="resolvePluginFlag(item.disabled)"
              @click="runMenuItem(item)"
            >
              <ActionGlyph
                v-if="resolvedIcon(item)"
                :icon="resolvedIcon(item)"
              />
              {{ item.label }}
            </button>
          </div>
        </template>
      </VPdfDropdownMenu>
    </div>
  </div>
</template>
