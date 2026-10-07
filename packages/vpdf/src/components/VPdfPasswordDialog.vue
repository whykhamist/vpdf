<script setup lang="ts">
import type { VPdfPasswordRequest } from "../types";
import { VPdfModal } from "./ui";
import VPdfPasswordForm from "./VPdfPasswordForm.vue";

defineProps<{
  request?: VPdfPasswordRequest;
}>();
</script>

<template>
  <VPdfModal v-if="request" @close="request.cancel()">
    <VPdfPasswordForm :request="request" @close="request.cancel()" />
  </VPdfModal>
</template>
