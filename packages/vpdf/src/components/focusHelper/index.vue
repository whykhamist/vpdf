<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  }
);

const focusHelper = ref<HTMLElement>();

const active = ref(false);
const events = computed(() => ({
  active: ["focus", "mouseenter"],
  inactive: ["blur", "mouseleave"],
}));

const onActive = () => {
  if (!props.disabled) {
    active.value = true;
  }
};

const onInactive = () => {
  active.value = false;
};

onMounted(() => {
  nextTick(() => {
    events.value.active.forEach((evtName) => {
      focusHelper.value?.parentElement?.addEventListener(evtName, onActive);
    });

    events.value.inactive.forEach((evtName) => {
      focusHelper.value?.parentElement?.addEventListener(evtName, onInactive);
    });
  });
});

onBeforeUnmount(() => {
  events.value.active.forEach((evtName) => {
    focusHelper.value?.parentElement?.removeEventListener(evtName, onActive);
  });

  events.value.inactive.forEach((evtName) => {
    focusHelper.value?.parentElement?.removeEventListener(evtName, onInactive);
  });
});
</script>

<template>
  <div
    ref="focusHelper"
    class="pointer-events-none absolute inset-0 transition-opacity"
    :class="{
      'opacity-0': !active,
      'opacity-20': active,
    }"
  />
</template>
