<script setup lang="ts">
const transitioning = ref(false);
</script>

<template>
  <div class="vpdf:flex vpdf:min-h-screen vpdf:flex-col">
    <div
      v-if="false"
      class="vpdf:fixed vpdf:top-0 vpdf:z-40 vpdf:h-10 vpdf:w-full vpdf:px-5 vpdf:py-2 vpdf:backdrop-blur-sm"
    >
      <div class="vpdf:flex vpdf:w-full vpdf:items-center vpdf:gap-2">
        <RouterLink
          :to="{ name: 'home' }"
          class="vpdf:text-2xl vpdf:font-semibold"
        >
          VPDF
        </RouterLink>
        <div class="vpdf:flex-auto"></div>
        <div class="vpdf:flex vpdf:items-stretch vpdf:gap-3">
          <a
            href="https://github.com/whykhamist/vpdf"
            target="_blank"
            class="vpdf:group vpdf:flex vpdf:items-center vpdf:gap-2"
          >
            <span
              class="vpdf:icon vpdf:icon-github vpdf:text-opacity-75 vpdf:group-hover:text-opacity-100 vpdf:text-2xl vpdf:text-foreground vpdf:transition-colors"
            />
            <span
              class="vpdf:border-b-2 vpdf:border-transparent vpdf:leading-none vpdf:text-foreground/75 vpdf:transition-colors vpdf:group-hover:border-foreground/50"
            >
              Github
              <span class="vpdf:icon vpdf:icon-call_made vpdf:text-xs" />
            </span>
          </a>
        </div>
      </div>
    </div>
    <div class="vpdf:relative vpdf:flex vpdf:flex-auto">
      <div class="vpdf:flex-auto">
        <RouterView v-slot="{ Component }">
          <transition
            enter-from-class="vpdf:opacity-0 vpdf:blur-md"
            leave-to-class="vpdf:opacity-0 vpdf:blur-md"
            enter-active-class="vpdf:transition vpdf:duration-300 vpdf:delay-300"
            leave-active-class="vpdf:transition vpdf:duration-300"
            @before-leave="transitioning = true"
            @after-enter="transitioning = false"
          >
            <component
              :is="Component"
              class="vpdf:mx-auto vpdf:h-full vpdf:w-full vpdf:px-3"
            >
            </component>
          </transition>
        </RouterView>
      </div>
    </div>
  </div>
</template>
