<template>
  <AuthLayout>
    <div>
      <h1 class="text-2xl font-bold text-center mb-6 text-gray-800">Регистрация</h1>
      <form @submit.prevent="handleRegister">
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
            minlength="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div class="mb-4">
          <label for="confirmPassword" class="block mb-2 text-gray-600 font-medium"
            >Подтвердите пароль</label
          >
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            minlength="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div v-if="validationError" class="text-red-600 bg-red-50 px-3 py-2 rounded-md mb-4 text-sm">
          {{ validationError }}
        </div>
        <div v-if="authStore.error" class="text-red-600 bg-red-50 px-3 py-2 rounded-md mb-4 text-sm">
          {{ authStore.error }}
        </div>
        <div
          v-if="successMessage"
          class="text-green-600 bg-green-50 px-3 py-2 rounded-md mb-4 text-sm"
        >
          {{ successMessage }}
        </div>
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full px-3 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {{ authStore.loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>
      <div class="mt-6 text-center text-gray-600">
        <p>
          Уже есть аккаунт?
          <router-link to="/login" class="text-blue-500 hover:underline">Войти</router-link>
        </p>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/core/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const validationError = ref('')
const successMessage = ref('')

async function handleRegister() {
  validationError.value = ''
  successMessage.value = ''

  if (password.value !== confirmPassword.value) {
    validationError.value = 'Пароли не совпадают'
    return
  }

  if (password.value.length < 6) {
    validationError.value = 'Пароль должен содержать минимум 6 символов'
    return
  }

  const result = await authStore.signUp(email.value, password.value)
  if (result.success) {
    successMessage.value = 'Регистрация успешна! Проверьте email для подтверждения.'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }
}
</script>
