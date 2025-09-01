<template>
  <div
    class="vpdf:flex vpdf:h-full vpdf:flex-col vpdf:items-center vpdf:justify-center"
  >
    <div
      class="vpdf:relative vpdf:flex vpdf:flex-col vpdf:items-center vpdf:gap-2 vpdf:text-center"
    >
      <div class="vpdf:text-9xl vpdf:font-black">404</div>
      <div
        class="vpdf:rounded-lg vpdf:bg-amber-700 vpdf:px-2 vpdf:font-semibold vpdf:text-white"
      >
        Page Not Found
      </div>
      <div class="vpdf:flex vpdf:items-center vpdf:justify-center">
        <RouterLink
          :to="{ name: 'home' }"
          class="vpdf:rounded-lg vpdf:border vpdf:border-foreground vpdf:px-5 vpdf:py-3 vpdf:font-bold vpdf:uppercase"
        >
          Home
        </RouterLink>
      </div>
    </div>
  </div>
</template>
