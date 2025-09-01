<script setup lang="ts">
const props = defineProps<{}>();

const open = defineModel<boolean>();
</script>

<template>
  <div class="vpdf:pointer-events-none vpdf:absolute vpdf:inset-0 vpdf:z-10">
    <div class="vpdf:relative vpdf:h-full vpdf:w-full">
      <div
        v-if="open"
        class="vpdf:pointer-events-auto vpdf:absolute vpdf:inset-0 vpdf:block vpdf:bg-foreground/15 vpdf:md:hidden"
        @click="open = false"
      />
      <div
        class="vpdf:pointer-events-auto vpdf:relative vpdf:flex vpdf:h-full vpdf:min-w-0 vpdf:flex-auto vpdf:flex-col vpdf:bg-background/75 vpdf:backdrop-blur-sm vpdf:transition-all"
        :class="{
          'vpdf:w-0': !open,
          'vpdf:w-72': open,
        }"
      >
        <slot
          :close="
            () => {
              open = false;
            }
          "
        ></slot>
      </div>
    </div>
  </div>
</template>
