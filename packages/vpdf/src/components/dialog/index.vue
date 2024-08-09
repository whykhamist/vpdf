<script setup lang="ts">
import { ref } from "vue";
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    persistent?: boolean;
  }>(),
  {
    modelValue: false,
    persistent: false,
  }
);
const emit = defineEmits(["update:modelValue"]);

const content = ref<HTMLElement>();

const close = (force: boolean = false) => {
  if (!props.persistent || force) {
    emit("update:modelValue", false);
  } else {
    shake();
  }
};

const shake = () => {
  if (!!content.value && !content.value.classList.contains("animate-shake")) {
    content.value.classList.add("animate-shake");
    content.value.addEventListener("animationend", () => {
      content.value?.classList.remove("animate-shake");
    });
  }
};
</script>

<template>
  <div v-if="modelValue" class="pointer-events-none absolute inset-0">
    <div class="pointer-events-none relative flex h-full w-full items-center">
      <div
        class="pointer-events-auto absolute inset-0 bg-gray-500/25"
        @click.stop="close(false)"
      />
      <div ref="content" class="pointer-events-auto static z-10 mx-auto">
        <slot :close="() => close(true)"></slot>
      </div>
    </div>
  </div>
</template>
