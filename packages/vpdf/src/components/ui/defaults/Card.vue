<script setup lang="ts">
import { inject, useId } from "vue";
import { VPDF_MODAL_TITLE_ID_KEY } from "../../../types/ui";

defineProps<{
  title?: string;
}>();

const generatedId = useId();
const headingId = inject(VPDF_MODAL_TITLE_ID_KEY, undefined) ?? generatedId;
</script>

<template>
  <div class="vpdf-card">
    <div v-if="title || $slots.header || $slots.title" class="vpdf-card-header">
      <slot name="header">
        <span class="vpdf-card-title">
          <slot name="title">{{ title }}</slot>
        </span>
      </slot>
    </div>
    <div class="vpdf-card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="vpdf-card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
