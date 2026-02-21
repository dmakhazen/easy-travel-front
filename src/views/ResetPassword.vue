<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h1 class="text-2xl font-bold text-center mb-6 text-gray-800">Сброс пароля</h1>

      <form v-if="!isRecoveryMode" @submit.prevent="handleRequestReset">
        <p class="text-sm text-gray-600 mb-4">
          Введите email, и мы отправим ссылку для восстановления пароля.
        </p>
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
        <div
          v-if="successMessage"
          class="text-green-600 bg-green-50 px-3 py-2 rounded-md mb-4 text-sm"
        >
          {{ successMessage }}
        </div>
        <div v-if="authStore.error" class="text-red-600 bg-red-50 px-3 py-2 rounded-md mb-4 text-sm">
          {{ authStore.error }}
        </div>
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full px-3 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {{ authStore.loading ? 'Отправка...' : 'Отправить ссылку' }}
        </button>
      </form>

      <form v-else @submit.prevent="handleUpdatePassword">
        <p class="text-sm text-gray-600 mb-4">Введите новый пароль для аккаунта.</p>
        <div class="mb-4">
          <label for="password" class="block mb-2 text-gray-600 font-medium">Новый пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            minlength="6"
            required
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
            minlength="6"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div v-if="validationError" class="text-red-600 bg-red-50 px-3 py-2 rounded-md mb-4 text-sm">
          {{ validationError }}
        </div>
        <div
          v-if="successMessage"
          class="text-green-600 bg-green-50 px-3 py-2 rounded-md mb-4 text-sm"
        >
          {{ successMessage }}
        </div>
        <div v-if="authStore.error" class="text-red-600 bg-red-50 px-3 py-2 rounded-md mb-4 text-sm">
          {{ authStore.error }}
        </div>
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full px-3 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {{ authStore.loading ? 'Сохранение...' : 'Сохранить новый пароль' }}
        </button>
      </form>

      <div class="mt-6 text-center text-gray-600 text-sm">
        <router-link to="/login" class="text-blue-500 hover:underline">Вернуться ко входу</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isRecoveryMode = ref(false)
const validationError = ref('')
const successMessage = ref('')

function hasRecoveryContext() {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  const hashParams = new URLSearchParams(hash)
  const routeType = Array.isArray(route.query.type) ? route.query.type[0] : route.query.type

  return routeType === 'recovery' || hashParams.get('type') === 'recovery' || !!hashParams.get('access_token')
}

function clearRecoveryUrl() {
  const cleanUrl = `${window.location.origin}${import.meta.env.BASE_URL}reset-password`
  window.history.replaceState({}, document.title, cleanUrl)
}

onMounted(() => {
  isRecoveryMode.value = hasRecoveryContext()
})

async function handleRequestReset() {
  successMessage.value = ''
  validationError.value = ''

  const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}reset-password`
  const result = await authStore.requestPasswordReset(email.value, redirectTo)
  if (result.success) {
    successMessage.value = 'Ссылка для сброса пароля отправлена на email.'
  }
}

async function handleUpdatePassword() {
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

  const result = await authStore.updatePassword(password.value)
  if (result.success) {
    clearRecoveryUrl()
    successMessage.value = 'Пароль обновлен. Выполняется переход.'
    setTimeout(() => {
      void router.replace('/')
    }, 1500)
  }
}
</script>
