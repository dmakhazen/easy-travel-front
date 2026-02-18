<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const open = ref(false)
const avatarRef = ref<HTMLElement | null>(null)

const initials = computed(() => {
  const email = authStore.user?.email
  if (!email) return '?'
  return email.slice(0, 2).toUpperCase()
})

function toggle() {
  open.value = !open.value
}

function onClickOutside(e: MouseEvent) {
  if (avatarRef.value && !avatarRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

async function handleLogout() {
  open.value = false
  await authStore.signOut()
  router.push('/login')
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="avatarRef" class="relative">
    <button
      @click="toggle"
      class="w-10 h-10 rounded-full bg-yellow-300 flex items-center justify-center text-sm font-semibold text-white cursor-pointer select-none"
    >
      {{ initials }}
    </button>
    <div
      v-if="open"
      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
    >
      <p class="px-4 py-2 text-sm text-gray-500 truncate border-b border-gray-100">
        {{ authStore.user?.email }}
      </p>
      <button
        @click="handleLogout"
        class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer"
      >
        Выйти
      </button>
    </div>
  </div>
</template>
