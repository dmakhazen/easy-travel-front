<template>
  <TripsLayout>
    <template #header>
      <h1 class="text-2xl font-bold text-white">Путешествия</h1>
    </template>

    <div>
      <ul v-if="trips.length" class="space-y-2">
        <li
          v-for="trip in trips"
          :key="trip.id"
          class="p-3 bg-gray-50 rounded-md border-l-4 border-blue-500"
        >
          {{ trip.title }}
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
            Также можно делиться путешествием и экспортировать его в файл.
          </p>
        </div>

        <button
          type="button"
          class="mx-auto mt-8 block w-full max-w-xs rounded bg-gray-400 px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-500"
        >
          создать новое путешествие
        </button>
      </div>
    </div>
  </TripsLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import TripsLayout from '@/components/core/TripsLayout.vue'

const trips = ref<any[]>([])

async function getTrips() {
  const { data, error } = await supabase.from('trips').select()
  if (error) {
    console.error('Ошибка при загрузке путешествий:', error)
  }
  trips.value = data || []
}

onMounted(() => {
  getTrips()
})
</script>
