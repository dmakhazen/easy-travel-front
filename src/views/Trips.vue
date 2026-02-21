<template>
  <TripsLayout>
    <template #header>
      <h1 class="text-2xl font-bold text-white">Путешествия</h1>
    </template>

    <div class="mx-auto w-full max-w-xl">
      <p v-if="errorMessage" class="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ errorMessage }}
      </p>

      <ul v-if="trips.length" class="space-y-3">
        <li
          v-for="trip in trips"
          :key="trip.id"
          class="rounded-xl border border-gray-200 bg-gray-50 p-4"
        >
          <button
            type="button"
            class="w-full text-left text-base font-medium text-gray-900"
            @click="router.push(`/trips/${trip.id}`)"
          >
            {{ trip.title }}
          </button>
          <div class="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              class="rounded-md bg-gray-200 px-3 py-2 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-300"
              @click="router.push(`/trips/${trip.id}/locations`)"
            >
              Места
            </button>
            <button
              type="button"
              class="rounded-md bg-gray-200 px-3 py-2 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-300"
              @click="router.push(`/trips/${trip.id}/wishes`)"
            >
              Желания
            </button>
            <button
              type="button"
              class="rounded-md bg-red-100 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
              :disabled="loading"
              @click="handleDeleteTrip(trip.id)"
            >
              Удалить
            </button>
          </div>
        </li>
      </ul>
      <div v-else class="mx-auto mt-8 max-w-md">
        <div class="rounded-lg bg-gray-100 p-8">
          <p class="mb-4 text-gray-700">
            Здесь будет ваш список путешествий и быстрый вход в детали каждой поездки.
          </p>
          <p class="mb-4 text-gray-700">
            Внутри путешествия доступны описание, список желаний и список мест.
          </p>
          <p class="text-gray-700">
            Дальше вы сможете экспортировать путешествие в файл.
          </p>
        </div>
      </div>

      <button
        type="button"
        class="mx-auto mt-8 block w-full max-w-xs rounded bg-teal-600 px-6 py-3 font-medium text-white transition-colors hover:bg-teal-700"
        @click="router.push('/trips/new')"
      >
        Создать новое путешествие
      </button>
    </div>
  </TripsLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TripsLayout from '@/components/core/TripsLayout.vue'
import { deleteTrip, listTrips, type Trip } from '@/services/travel'

const router = useRouter()
const trips = ref<Trip[]>([])
const loading = ref(false)
const errorMessage = ref('')

async function getTrips() {
  loading.value = true
  errorMessage.value = ''
  try {
    trips.value = await listTrips()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Ошибка при загрузке путешествий'
  } finally {
    loading.value = false
  }
}

async function handleDeleteTrip(tripId: string) {
  loading.value = true
  errorMessage.value = ''
  try {
    await deleteTrip(tripId)
    trips.value = trips.value.filter((trip) => trip.id !== tripId)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось удалить путешествие'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void getTrips()
})
</script>
