<script setup lang="ts">
import { computed } from 'vue'
import type { VPdfViewerApi } from '../composables/useVPdfViewer'
import SearchBar from '../plugins/builtins/SearchBar.vue'
import { runSearchFind, toggleSearchOption, type VPdfSearchOption } from '../plugins/builtins/searchOptions'

const props = defineProps<{
  api: VPdfViewerApi
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const search = computed(() => props.api.state.value.search)
</script>

<template>
  <SearchBar
    v-if="open"
    :search="search"
    :on-query="(value) => { api.mutableState.value.search.query = value }"
    :on-find="(findPrevious) => {
      runSearchFind(api.controller, api.state.value.search, search.query, findPrevious)
    }"
    :on-toggle-option="(option: VPdfSearchOption) => {
      api.controller.find(toggleSearchOption(search, option, search.query))
    }"
    :on-close="() => { emit('update:open', false); api.controller.clearFind() }"
  />
</template>
