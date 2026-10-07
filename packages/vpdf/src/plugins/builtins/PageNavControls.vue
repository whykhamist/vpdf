<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import { VPDF_ICON_SLOTS } from "../../icons";
import VPdfIcon from "../../components/VPdfIcon.vue";
import { VPdfButton, VPdfInput } from "../../components/ui";

const props = defineProps<{
  pageNumber: number;
  pageCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onGoToPage: (page: number) => void;
}>();

const pagerId = useId();
const draft = ref(String(props.pageNumber));
const inputSize = computed(() => Math.max(String(props.pageCount).length, 3));

watch(
  () => props.pageNumber,
  (page) => {
    draft.value = String(page);
  },
);

function commitPage(event?: Event) {
  const raw =
    event?.target instanceof HTMLInputElement ? event.target.value : draft.value;
  const n = Number(raw);
  if (Number.isInteger(n) && n >= 1 && n <= props.pageCount) {
    props.onGoToPage(n);
    draft.value = String(n);
    return;
  }
  draft.value = String(props.pageNumber);
  if (event?.target instanceof HTMLInputElement) {
    event.target.value = draft.value;
  }
}
</script>

<template>
  <span class="vpdf-toolbar-cluster">
    <span class="vpdf-page-nav">
      <VPdfButton
        title="Previous page"
        aria-label="Previous page"
        :disabled="pageNumber <= 1"
        @click="onPrevious()"
      >
        <VPdfIcon :name="VPDF_ICON_SLOTS.previousPage" />
      </VPdfButton>
      <VPdfButton
        title="Next page"
        aria-label="Next page"
        :disabled="pageNumber >= pageCount"
        @click="onNext()"
      >
        <VPdfIcon :name="VPDF_ICON_SLOTS.nextPage" />
      </VPdfButton>
    </span>

    <label class="vpdf-page-input" :for="pagerId">
      <span class="vpdf-sr-only">Page</span>
      <VPdfInput
        :id="pagerId"
        v-model="draft"
        :size="inputSize"
        inputmode="numeric"
        autocomplete="off"
        :disabled="pageCount < 1"
        @change="commitPage"
      />
      <span>/</span>
      <span aria-live="polite">{{ pageCount || "–" }}</span>
    </label>
  </span>
</template>
