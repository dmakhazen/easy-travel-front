<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="bg-white p-8 rounded-lg shadow-lg">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Добро пожаловать в Easy Travel!</h1>
      <div
        v-if="authStore.user"
        class="bg-blue-50 p-4 rounded-md mb-8 flex justify-between items-center"
      >
        <p class="text-gray-700">
          Вы вошли как: <strong class="text-gray-900">{{ authStore.user.email }}</strong>
        </p>
        <button
          @click="handleLogout"
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Выйти
        </button>
      </div>
      <div class="mt-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-semibold text-gray-700">Инструменты</h2>
        </div>
        <ul v-if="instruments.length" class="space-y-2">
          <li
            v-for="instrument in instruments"
            :key="instrument.id"
            class="p-3 bg-gray-50 rounded-md border-l-4 border-blue-500"
          >
            {{ instrument.name }}
          </li>
        </ul>
        <p v-else class="text-gray-500">Нет инструментов</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const authStore = useAuthStore()
const instruments = ref<any[]>([])

async function getInstruments() {
  const { data, error } = await supabase.from('instruments').select()
  if (error) {
    console.error('Ошибка при загрузке инструментов:', error)
  }
  instruments.value = data || []
}

async function handleLogout() {
  await authStore.signOut()
  router.push('/login')
}

onMounted(() => {
  getInstruments()
})
</script>
