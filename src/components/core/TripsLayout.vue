<script setup lang="ts">
import UserAvatar from '@/components/core/UserAvatar.vue'
</script>

<template>
  <div class="h-screen w-full flex flex-col overflow-hidden bg-teal-500">
    <div class="shrink-0 py-4 px-6 flex items-center justify-between">
      <router-link to="/" class="text-sm font-semibold uppercase tracking-wide text-white hover:opacity-90">
        easy travel
      </router-link>
      <UserAvatar />
    </div>
    <div class="flex-1 bg-white rounded-t-3xl px-6 pt-6 pb-8 overflow-y-auto min-h-0">
      <div v-if="$slots.header" class="mb-5 [&_h1]:text-center [&_h1]:text-gray-900">
        <slot name="header"></slot>
      </div>
      <slot></slot>
    </div>
  </div>
</template>
