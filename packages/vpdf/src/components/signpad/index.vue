<script setup lang="ts">
import { ref } from "vue";
import SignDraw from "./draw.vue";

import {
  PDFCard,
  PDFCardHeader,
  PDFCardFooter,
  PDFCardBody,
  PDFCardTitle,
  PDFButton,
} from "../misc";
// const props = defineProps<{}>();

const emit = defineEmits(["close", "sign"]);

const signPad = ref();
</script>

<template>
  <PDFCard class="select-none">
    <PDFCardHeader>
      <PDFCardTitle class="font-semibold"> Signature </PDFCardTitle>
      <PDFButton icon="close" class="rounded-full p-1" @click="emit('close')" />
    </PDFCardHeader>
    <PDFCardBody class="min-h-64">
      <SignDraw ref="signPad" />
    </PDFCardBody>
    <PDFCardFooter class="justify-end py-1">
      <PDFButton
        label="Ok"
        class="min-w-16 rounded-lg bg-secondary px-3 py-1 font-bold"
        @click="emit('sign', signPad?.getData())"
      />
      <PDFButton
        label="Close"
        class="rounded-lg px-3 py-1"
        @click="emit('close')"
      />
    </PDFCardFooter>
  </PDFCard>
</template>
