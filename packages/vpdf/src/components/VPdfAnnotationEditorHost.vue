<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, type Component } from 'vue'
import type {
  VPdfAnnotationEditorActions,
  VPdfAnnotationEditorKind,
  VPdfAnnotationEditorParams,
} from '../types'
import { findVisibleAnnotationEditorToolbar } from '../utils/annotationEditor'
import VPdfAnnotationEditor from './VPdfAnnotationEditor.vue'

const props = defineProps<{
  editorType?: VPdfAnnotationEditorKind
  params: VPdfAnnotationEditorParams
  canDelete: boolean
  actions: VPdfAnnotationEditorActions
  container?: HTMLElement
  editorComponent?: Component
}>()

const Editor = computed(() => props.editorComponent ?? VPdfAnnotationEditor)
const target = ref<HTMLElement>()
let observer: MutationObserver | undefined

function syncTarget() {
  target.value = findVisibleAnnotationEditorToolbar(props.container)
}

function observe() {
  observer?.disconnect()
  if (!props.container) {
    target.value = undefined
    return
  }
  observer = new MutationObserver(syncTarget)
  observer.observe(props.container, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  })
  syncTarget()
}

watch(() => props.container, observe)
watch(() => props.canDelete, syncTarget)

onMounted(observe)
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <span class="vpdf-annotation-editor-portal" hidden>
    <Teleport v-if="target && canDelete" :to="target">
      <component
        :is="Editor"
        :editor-type="editorType"
        :params="params"
        :can-delete="canDelete"
        :actions="actions"
      />
    </Teleport>
  </span>
</template>
