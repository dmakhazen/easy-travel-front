<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="message"
        class="pointer-events-none fixed left-1/2 top-4 z-[1000] w-[min(92vw,28rem)] -translate-x-1/2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-lg"
      >
        {{ message }}
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>
