<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h1 class="text-2xl font-bold text-center mb-6 text-gray-800">Вход</h1>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="email" class="block mb-2 text-gray-600 font-medium">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div class="mb-4">
          <label for="password" class="block mb-2 text-gray-600 font-medium">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div v-if="authStore.error" class="text-red-600 bg-red-50 px-3 py-2 rounded-md mb-4 text-sm">
          {{ authStore.error }}
        </div>
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full px-3 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {{ authStore.loading ? 'Вход...' : 'Войти' }}
        </button>
      </form>
      <div class="mt-6 text-center text-gray-600">
        <p>
          Нет аккаунта?
          <router-link to="/register" class="text-blue-500 hover:underline">
            Зарегистрироваться
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

async function handleLogin() {
  const result = await authStore.signIn(email.value, password.value)
  if (result.success) {
    router.push('/')
  }
}
</script>