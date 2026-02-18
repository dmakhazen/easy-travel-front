<script setup lang="ts">
import UserAvatar from "@/components/core/UserAvatar.vue";
</script>

<template>
  <div class="h-screen w-full flex flex-col overflow-hidden bg-teal-500">
    <!-- Header area -->
    <div class="shrink-0 py-4 px-6 flex items-center justify-between">
      <slot name="header"></slot>
      <UserAvatar />
    </div>
    <!-- Content card overlapping header -->
    <div class="flex-1 bg-white rounded-t-3xl px-6 pt-6 pb-8 overflow-y-auto min-h-0">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
</style>
