<template>
  <Layout>
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
      <p v-else class="text-gray-500">Вы пока не создали путешествий</p>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import Layout from '@/components/core/layout.vue'

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
