<template>
  <div class="relative">
    <div class="flex items-center bg-black/10 p-1">
      <div
        class="relative mx-auto border border-black/25 bg-white bg-checkered-md"
      >
        <div class="absolute top-1/3 z-0 w-full border-b-2 border-black/25" />
        <div
          class="absolute bottom-1/4 z-0 w-full border-b-4 border-green-700/25"
        />
        <slot />
      </div>
    </div>
    <div class="flex min-h-12 items-center gap-1 px-3 py-1">
      <slot name="actions" />
    </div>
  </div>
</template>
