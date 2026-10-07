<script setup lang="ts">
import { computed, ref, useId } from "vue";
import type { VPdfSearchState } from "../../types";
import { VPDF_ICON_SLOTS } from "../../icons";
import VPdfIcon from "../../components/VPdfIcon.vue";
import {
  VPdfButton,
  VPdfCheckbox,
  VPdfDropdownMenu,
  VPdfInput,
} from "../../components/ui";
import { canAdvanceFind, type VPdfSearchOption } from "./searchOptions";

const props = defineProps<{
  search: VPdfSearchState;
  onQuery: (value: string) => void;
  onFind: (findPrevious: boolean) => void;
  onToggleOption: (option: VPdfSearchOption) => void;
  onClose: () => void;
}>();

const OPTIONS: Array<{
  option: VPdfSearchOption;
  label: string;
  title: string;
}> = [
  {
    option: "highlightAll",
    label: "Highlight All",
    title: "Highlight All (Alt+A)",
  },
  { option: "caseSensitive", label: "Match Case", title: "Match Case (Alt+C)" },
  {
    option: "matchDiacritics",
    label: "Match Diacritics",
    title: "Match Diacritics (Alt+I)",
  },
  { option: "entireWord", label: "Whole Words", title: "Whole Words (Alt+W)" },
];

const optionsOpen = ref(false);
const optionsMenuId = useId();

const noMatch = computed(
  () =>
    Boolean(props.search.query.trim()) && props.search.status === "not-found",
);
const canNavigate = computed(() =>
  canAdvanceFind(props.search, props.search.query),
);

function runFind(findPrevious = false) {
  if (!props.search.query.trim()) return;
  props.onFind(findPrevious);
}

function isPressed(option: VPdfSearchOption) {
  return props.search[option];
}

function onBarKeydown(event: KeyboardEvent) {
  const cmd = event.ctrlKey || event.metaKey;
  if (event.key === "Escape") {
    event.preventDefault();
    if (optionsOpen.value) {
      optionsOpen.value = false;
      return;
    }
    props.onClose();
    return;
  }
  if (cmd && event.key.toLowerCase() === "g") {
    event.preventDefault();
    runFind(event.shiftKey);
    return;
  }
  if (!event.altKey || cmd) return;
  const key = event.key.toLowerCase();
  const option =
    key === "a" || key === "l"
      ? "highlightAll"
      : key === "c"
        ? "caseSensitive"
        : key === "i"
          ? "matchDiacritics"
          : key === "w"
            ? "entireWord"
            : undefined;
  if (!option) return;
  event.preventDefault();
  props.onToggleOption(option);
}
</script>

<template>
  <div
    class="vpdf-searchbar"
    role="search"
    aria-label="Find in document"
    @keydown="onBarKeydown"
  >
    <label class="vpdf-search-field">
      <span class="vpdf-sr-only">Find</span>
      <VPdfInput
        type="search"
        placeholder="Find in document…"
        autocomplete="off"
        :invalid="noMatch"
        :model-value="search.query"
        @update:model-value="onQuery($event)"
        @keydown.enter.exact.prevent="runFind(false)"
        @keydown.enter.shift.prevent="runFind(true)"
      />
    </label>
    <div class="vpdf-toolbar vpdf:flex-auto">
      <div class="vpdf-toolbar-group vpdf:flex-auto">
        <div class="vpdf:inline-flex vpdf:items-center vpdf:gap-0.5">
          <VPdfButton
            class="vpdf:min-w-0!"
            title="Previous match"
            aria-label="Previous match"
            :disabled="!canNavigate"
            @click="runFind(true)"
          >
            <VPdfIcon :name="VPDF_ICON_SLOTS.searchPrevious" />
          </VPdfButton>
          <VPdfButton
            class="vpdf:min-w-0!"
            title="Next match"
            aria-label="Next match"
            :disabled="!canNavigate"
            @click="runFind(false)"
          >
            <VPdfIcon :name="VPDF_ICON_SLOTS.searchNext" />
          </VPdfButton>
        </div>
        <span
          class="vpdf-search-count"
          :class="{ 'vpdf-search-count-error': noMatch }"
          aria-live="polite"
        >
          <template v-if="search.status === 'pending' && search.query">
            Searching…
          </template>
          <template v-else-if="noMatch">Phrase not found</template>
          <template v-else-if="search.query && search.matchCount">
            {{ search.currentMatch }} / {{ search.matchCount }}
          </template>
        </span>
        <VPdfDropdownMenu v-model:open="optionsOpen">
          <template #default="{ toggle, open }">
            <VPdfButton
              title="Search options"
              aria-label="Search options"
              aria-haspopup="true"
              :aria-expanded="open"
              :aria-controls="optionsMenuId"
              @click.stop="toggle"
            >
              <VPdfIcon :name="VPDF_ICON_SLOTS.searchMore" />
            </VPdfButton>
          </template>
          <template #content>
            <div
              :id="optionsMenuId"
              class="vpdf-search-options-menu"
              role="group"
              aria-label="Search options"
            >
              <VPdfCheckbox
                v-for="item in OPTIONS"
                :key="item.option"
                class="vpdf-search-option"
                :title="item.title"
                :aria-label="item.title"
                :model-value="isPressed(item.option)"
                :label="item.label"
                @update:model-value="onToggleOption(item.option)"
              />
            </div>
          </template>
        </VPdfDropdownMenu>
      </div>
      <VPdfButton
        title="Close search"
        aria-label="Close search"
        @click="onClose()"
      >
        <VPdfIcon :name="VPDF_ICON_SLOTS.searchClose" />
      </VPdfButton>
    </div>
  </div>
</template>
