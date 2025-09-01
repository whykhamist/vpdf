<script setup lang="ts">
import { defineAsyncComponent, nextTick, onMounted, ref } from "vue";
import { uniqid } from "../../composables";

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

const passId = uniqid();

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
    class="vpdf:w-screen-95 vpdf:flex vpdf:max-w-sm vpdf:flex-col vpdf:overflow-hidden vpdf:rounded-lg vpdf:border vpdf:border-background-400/75 vpdf:bg-background-200 vpdf:text-background-700 vpdf:shadow-md"
  >
    <div
      class="vpdf:flex vpdf:items-center vpdf:gap-2 vpdf:border-b vpdf:border-background-400/25 vpdf:bg-background-600 vpdf:px-3 vpdf:py-1 vpdf:text-foreground"
    >
      <div class="vpdf:flex-auto vpdf:text-lg vpdf:font-semibold">Password</div>
      <Button
        v-if="false"
        icon="close"
        class="vpdf:rounded-full vpdf:p-1"
        @click="emit('close')"
      />
    </div>
    <div
      class="vpdf:flex vpdf:min-h-0 vpdf:flex-auto vpdf:flex-col vpdf:gap-2 vpdf:overflow-auto vpdf:bg-background vpdf:px-3 vpdf:py-1"
    >
      <div
        class="vpdf:flex vpdf:items-center vpdf:gap-3 vpdf:rounded-lg vpdf:border vpdf:border-accent-400 vpdf:bg-accent-400/25 vpdf:px-3 vpdf:py-1"
      >
        <Icon
          name="warning"
          class="vpdf:aspect-square vpdf:text-5xl vpdf:text-accent"
        />
        <div class="vpdf:leading-tight vpdf:font-semibold vpdf:text-accent">
          The pdf file is protected. Please enter the document's password to
          continue.
        </div>
      </div>
      <label
        :for="passId"
        class="vpdf:mb-3 vpdf:flex vpdf:items-center vpdf:justify-end vpdf:gap-2 vpdf:text-accent"
      >
        <span>Enter Password: </span>
        <div
          class="vpdf:relative vpdf:flex vpdf:items-center vpdf:gap-2 vpdf:rounded-lg vpdf:border vpdf:border-foreground/25 vpdf:bg-background vpdf:px-2 vpdf:py-0.5 vpdf:text-foreground vpdf:focus-within:border-primary-700/75"
        >
          <input
            :id="passId"
            ref="inpt"
            v-model="password"
            type="password"
            class="vpdf:bg-transparent vpdf:leading-none vpdf:outline-none"
            @keyup.enter="updatePassword"
          />
          <div
            class="vpdf:absolute vpdf:top-full vpdf:text-center vpdf:text-xs vpdf:font-semibold vpdf:text-negative-600"
          >
            {{ error }}
          </div>
        </div>
      </label>
    </div>

    <div
      class="vpdf:flex vpdf:items-center vpdf:justify-end vpdf:gap-2 vpdf:bg-accent/25 vpdf:px-3 vpdf:py-2"
    >
      <Button
        label="Ok"
        class="vpdf:w-24 vpdf:rounded-lg vpdf:border vpdf:border-background-400/75 vpdf:bg-background vpdf:px-3 vpdf:py-1 vpdf:font-bold vpdf:text-foreground-700 vpdf:hover:border-primary-400"
        @click="updatePassword"
      />
      <Button
        v-if="false"
        label="Cancel"
        class="vpdf:w-24 vpdf:rounded-lg vpdf:border vpdf:border-background-400/75 vpdf:bg-background vpdf:px-3 vpdf:py-1 vpdf:text-foreground-700 vpdf:hover:border-primary-400"
        @click="emit('close')"
      />
    </div>
  </div>
</template>
