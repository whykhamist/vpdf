<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import type { VPdfPasswordRequest } from "../types";
import { VPdfButton, VPdfCard, VPdfInput } from "./ui";

const props = defineProps<{
  request: VPdfPasswordRequest;
}>();

const emit = defineEmits<{
  close: [];
}>();

const password = ref("");
const fieldRef = ref<HTMLElement>();

async function focusInput() {
  await nextTick();
  fieldRef.value?.querySelector("input")?.focus();
}

watch(
  () => props.request,
  async (request) => {
    password.value = "";
    if (!request) return;
    await focusInput();
  },
  { immediate: true },
);

onMounted(() => {
  void focusInput();
});

function submit() {
  props.request.submit(password.value);
  password.value = "";
}

function cancel() {
  props.request.cancel();
  password.value = "";
  emit("close");
}
</script>

<template>
  <VPdfCard title="Password required">
    <p id="vpdf-password-desc" class="vpdf-dialog-desc">
      {{
        request.reason === "incorrect"
          ? "Incorrect password. Try again."
          : "This PDF is password protected."
      }}
    </p>
    <label ref="fieldRef" class="vpdf-field">
      <span class="vpdf-sr-only">Password</span>
      <VPdfInput
        v-model="password"
        type="password"
        autocomplete="current-password"
        aria-describedby="vpdf-password-desc"
        @keydown.enter.prevent="submit"
        @keydown.escape.prevent="cancel"
      />
    </label>
    <template #footer>
      <VPdfButton v-if="false" variant="outline" @click="cancel">
        Cancel
      </VPdfButton>
      <VPdfButton variant="solid" @click="submit">Unlock</VPdfButton>
    </template>
  </VPdfCard>
</template>
