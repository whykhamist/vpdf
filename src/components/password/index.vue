<script setup lang="ts">
import { defineAsyncComponent, nextTick, onMounted, ref } from "vue";

const Icon = defineAsyncComponent(() => import("../icons/index.vue"));
const Button = defineAsyncComponent(() => import("../button/index.vue"));

const props = defineProps<{
  callback: Function;
  reason: any;
}>();
const emit = defineEmits(["close"]);
const inpt = ref();
const password = ref();
const error = ref<string>();

const updatePassword = () => {
  props.callback(password.value);
};

onMounted(() => {
  if (props.reason > 1) {
    error.value = "Invalid Password!";
  }
  nextTick(() => {
    inpt.value?.focus();
  });
});
</script>

<template>
  <div
    class="flex w-screen-95 max-w-sm flex-col overflow-hidden rounded-lg border border-gray-400/75 bg-gray-200 text-gray-700 shadow-md"
  >
    <div
      class="flex items-center gap-2 border-b border-gray-400/25 bg-gray-600 px-3 py-1 text-white"
    >
      <div class="flex-auto text-lg font-semibold">Password</div>
      <Button
        v-if="false"
        icon="close"
        iconClass="aspect-square w-4 fill-gray-100"
        class="rounded-full p-1"
        @click="emit('close')"
      />
    </div>
    <div
      class="flex min-h-0 flex-auto flex-col gap-2 overflow-auto bg-white px-3 py-1"
    >
      <div
        class="flex items-center gap-3 rounded-lg border border-amber-400 bg-amber-400/25 px-3 py-1"
      >
        <Icon name="warning" class="aspect-square w-16 fill-amber-600" />
        <div class="font-semibold leading-tight">
          The pdf file is protected. Please enter the document's password to
          continue.
        </div>
      </div>
      <label
        for="__PDF_PASSWORD_INPUT__"
        class="flex items-center justify-end gap-2"
      >
        <span>Enter Password: </span>
        <div
          class="relative mb-3 flex items-center gap-2 rounded-lg border border-black/25 bg-white px-2 py-0.5 text-black focus-within:border-blue-700/75"
        >
          <input
            id="__PDF_PASSWORD_INPUT__"
            ref="inpt"
            v-model="password"
            type="password"
            class="bg-transparent outline-none"
            @keyup.enter="updatePassword"
          />
          <div
            class="absolute top-full text-center text-xs font-semibold text-rose-600"
          >
            {{ error }}
          </div>
        </div>
      </label>
    </div>

    <div class="flex items-center justify-end gap-2 bg-white px-3 py-2">
      <Button
        label="Ok"
        class="w-24 rounded-lg border border-gray-400/75 bg-white px-3 py-1 font-bold text-gray-700 hover:border-blue-400"
        @click="updatePassword"
      />
      <Button
        v-if="false"
        label="Cancel"
        class="w-24 rounded-lg border border-gray-400/75 bg-white px-3 py-1 text-gray-700 hover:border-blue-400"
        @click="emit('close')"
      />
    </div>
  </div>
</template>
