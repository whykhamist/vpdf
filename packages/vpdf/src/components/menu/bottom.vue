<script setup lang="ts">
import type { ScaleOptions } from "../../types/scales";

import Pager from "./pager.vue";
import Zoomer from "./zoomer.vue";
import Separator from "../separator/index.vue";
import Button from "../button/index.vue";
import { ref } from "vue";

const props = defineProps<{
  scales: ScaleOptions;
  pages: number;
  pageMode: "vertical" | "horizontal";
}>();

const page = defineModel<number>("page", { required: true });
const scale = defineModel<number>("scale", { required: true });

const hide = ref(false);
</script>

<template>
  <div
    class="vpdf:absolute vpdf:bottom-8 vpdf:z-[5] vpdf:rounded-full vpdf:bg-background-700 vpdf:px-3 vpdf:py-2 vpdf:text-primary-200 vpdf:transition-all vpdf:sm:hidden"
    :class="{
      'vpdf:right-1/2 vpdf:w-[17.5rem] vpdf:translate-x-1/2': !hide,
      'vpdf:right-4': hide,
    }"
  >
    <div class="vpdf:flex vpdf:items-center">
      <template v-if="!hide">
        <div class="vpdf:flex vpdf:flex-auto vpdf:items-center">
          <span
            class="vpdf:text-xs vpdf:leading-none vpdf:font-bold vpdf:uppercase"
          >
            Page
          </span>
          <Pager v-model="page" :mode="pageMode" :pages />
        </div>
        <Separator mode="vertical" class="vpdf:place-self-stretch" />
        <Zoomer
          v-model:scale="scale"
          :scales="scales"
          :ui="{
            select: 'vpdf:bg-background-600',
          }"
          hideSelection
        />
        <Separator mode="vertical" class="vpdf:place-self-stretch" />
      </template>
      <div
        class="vpdf:transition-all"
        :class="{
          'vpdf:pl-2': !hide,
          ' ': hide,
        }"
      >
        <Button
          @click="hide = !hide"
          :icon="hide ? 'menu' : 'close'"
          :class="{ 'vpdf:text-sm': hide, 'vpdf:text-lg': !hide }"
        />
      </div>
    </div>
  </div>
</template>
