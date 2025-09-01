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
  },
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
  if (
    !!content.value &&
    !content.value.classList.contains("vpdf:animate-shake")
  ) {
    content.value.classList.add("vpdf:animate-shake");
    content.value.addEventListener("animationend", () => {
      content.value?.classList.remove("vpdf:animate-shake");
    });
  }
};
</script>

<template>
  <div
    v-if="modelValue"
    class="vpdf:pointer-events-none vpdf:absolute vpdf:inset-0"
  >
    <div
      class="vpdf:pointer-events-none vpdf:relative vpdf:flex vpdf:h-full vpdf:w-full vpdf:items-center"
    >
      <div
        class="vpdf:pointer-events-auto vpdf:absolute vpdf:inset-0 vpdf:bg-background-500/25"
        @click.stop="close(false)"
      />
      <div
        ref="content"
        class="vpdf:pointer-events-auto vpdf:static vpdf:z-10 vpdf:mx-auto"
      >
        <slot :close="() => close(true)"></slot>
      </div>
    </div>
  </div>
</template>
