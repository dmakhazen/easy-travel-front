<template>
  <TripsLayout>
    <template #header>
      <h1 class="text-2xl font-bold text-white">Путешествие</h1>
    </template>

    <div class="mx-auto w-full max-w-xl space-y-6">
      <div class="grid grid-cols-3 gap-2 rounded-lg border border-gray-200 bg-gray-100 p-1">
        <button
          type="button"
          class="rounded-md px-3 py-2 text-sm font-medium"
          :class="'bg-teal-600 text-white'"
          @click="router.push(tripId ? `/trips/${tripId}` : '/trips/new')"
        >
          Описание
        </button>
        <button
          type="button"
          class="rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          :class="'bg-white text-gray-700 hover:bg-gray-200'"
          :disabled="!tripId"
          @click="tripId && router.push(`/trips/${tripId}/wishes`)"
        >
          Желания
        </button>
        <button
          type="button"
          class="rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          :class="'bg-white text-gray-700 hover:bg-gray-200'"
          :disabled="!tripId"
          @click="tripId && router.push(`/trips/${tripId}/locations`)"
        >
          Места
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="handleNext">
        <div>
          <label for="title" class="mb-2 block text-sm font-medium text-gray-700">Название путешествия</label>
          <input
            id="title"
            v-model="title"
            type="text"
            required
            maxlength="120"
            placeholder="Например, Париж весной 2025"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <p v-if="errorMessage" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ errorMessage }}
        </p>

        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="rounded-md bg-gray-200 px-4 py-3 font-medium text-gray-800 disabled:opacity-60"
            :disabled="loading || !tripId"
            @click="handleExport"
          >
            Экспорт
          </button>
          <button
            type="submit"
            class="rounded-md bg-teal-600 px-4 py-3 font-medium text-white disabled:opacity-60"
            :disabled="loading"
          >
            {{ loading ? 'Сохранение...' : 'Далее' }}
          </button>
        </div>
      </form>
    </div>
  </TripsLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TripsLayout from '@/components/core/TripsLayout.vue'
import { createTrip, exportTripBundle, getTripById, updateTrip } from '@/services/travel'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const errorMessage = ref('')
const title = ref('')
const initialTitle = ref('')

const tripId = computed(() => {
  const value = route.params.tripId
  return typeof value === 'string' ? value : ''
})

async function loadTrip() {
  if (!tripId.value) return

  loading.value = true
  errorMessage.value = ''
  try {
    const trip = await getTripById(tripId.value)
    title.value = trip.title
    initialTitle.value = trip.title
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось загрузить путешествие'
  } finally {
    loading.value = false
  }
}

function sanitizeFileName(raw: string) {
  const value = raw.trim().toLowerCase()
  return value.replace(/[^a-z0-9а-яё_-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'trip'
}

async function handleExport() {
  if (!tripId.value) return

  loading.value = true
  errorMessage.value = ''
  try {
    const bundle = await exportTripBundle(tripId.value)
    const fileName = `${sanitizeFileName(bundle.trip.title)}.json`
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось экспортировать путешествие'
  } finally {
    loading.value = false
  }
}

async function handleNext() {
  const normalizedTitle = title.value.trim()

  if (!normalizedTitle) {
    errorMessage.value = 'Введите название путешествия'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    if (tripId.value) {
      if (normalizedTitle !== initialTitle.value.trim()) {
        await updateTrip(tripId.value, normalizedTitle)
        initialTitle.value = normalizedTitle
      }
      await router.push(`/trips/${tripId.value}/wishes`)
      return
    }

    const trip = await createTrip(normalizedTitle)
    await router.push(`/trips/${trip.id}/wishes`)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось сохранить путешествие'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadTrip()
})
</script>
