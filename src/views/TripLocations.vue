<template>
  <TripsLayout>
    <div class="mx-auto w-full max-w-xl space-y-6">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-2xl font-bold text-gray-900">Места</h1>
        <p class="max-w-[14rem] truncate text-sm font-medium text-gray-500">{{ tripTitle }}</p>
      </div>

      <div class="grid grid-cols-3 gap-2 rounded-lg border border-gray-200 bg-gray-100 p-1">
        <button
          type="button"
          class="rounded-md px-3 py-2 text-sm font-medium bg-white text-gray-700 hover:bg-gray-200"
          @click="router.push(`/trips/${tripId}`)"
        >
          Описание
        </button>
        <button
          type="button"
          class="rounded-md px-3 py-2 text-sm font-medium bg-white text-gray-700 hover:bg-gray-200"
          @click="router.push(`/trips/${tripId}/wishes`)"
        >
          Желания
        </button>
        <button type="button" class="rounded-md px-3 py-2 text-sm font-medium bg-teal-600 text-white">
          Места
        </button>
      </div>

      <p v-if="errorMessage" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ errorMessage }}
      </p>

      <div v-for="(wish, index) in wishes" :key="wish.id" class="rounded-xl border border-gray-200 p-4">
        <div class="mb-3 flex items-center gap-2">
          <span
            class="inline-flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-xs font-semibold"
          >
            {{ index + 1 }}
          </span>
          <p class="text-sm font-medium text-gray-800">{{ wish.title }}</p>
        </div>

        <ul class="space-y-2">
          <li v-for="place in placesByWish[wish.id] ?? []" :key="place.id" class="flex items-center gap-2">
            <input
              :value="placeEditValues[place.id] ?? place.title"
              type="text"
              maxlength="120"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
              @input="setPlaceEditValue(place.id, $event)"
            />
            <button
              type="button"
              class="rounded-md bg-gray-200 px-3 py-2 text-xs font-medium text-gray-800"
              :disabled="loading"
              @click="handleUpdatePlace(wish.id, place.id)"
            >
              Сохр.
            </button>
            <button
              type="button"
              class="rounded-md bg-red-100 px-3 py-2 text-xs font-medium text-red-700"
              :disabled="loading"
              @click="handleDeletePlace(wish.id, place.id)"
            >
              Удал.
            </button>
          </li>
        </ul>

        <form class="mt-3 flex gap-2" @submit.prevent="handleCreatePlace(wish.id)">
          <input
            v-model="newPlaceTitles[wish.id]"
            type="text"
            required
            maxlength="120"
            placeholder="Добавить место"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            class="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            :disabled="loading"
          >
            +
          </button>
        </form>
      </div>

      <button
        type="button"
        class="w-full rounded-md bg-teal-600 px-4 py-3 font-medium text-white"
        @click="router.push('/')"
      >
        Завершить
      </button>
    </div>
  </TripsLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TripsLayout from '@/components/core/TripsLayout.vue'
import {
  createPlace,
  deletePlace,
  getTripById,
  listPlacesByWish,
  listWishesByTrip,
  type Place,
  type Wish,
  updatePlace,
} from '@/services/travel'

const route = useRoute()
const router = useRouter()
const tripId = route.params.tripId as string

const loading = ref(false)
const errorMessage = ref('')
const tripTitle = ref('')
const wishes = ref<Wish[]>([])
const placesByWish = ref<Record<string, Place[]>>({})
const newPlaceTitles = ref<Record<string, string>>({})
const placeEditValues = ref<Record<string, string>>({})

function setPlaceEditValue(placeId: string, event: Event) {
  const input = event.target as HTMLInputElement
  placeEditValues.value[placeId] = input.value
}

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const [trip, loadedWishes] = await Promise.all([getTripById(tripId), listWishesByTrip(tripId)])
    tripTitle.value = trip.title
    wishes.value = loadedWishes

    const loadedPlaces = await Promise.all(
      loadedWishes.map(async (wish) => ({
        wishId: wish.id,
        places: await listPlacesByWish(wish.id),
      })),
    )

    placesByWish.value = Object.fromEntries(loadedPlaces.map((entry) => [entry.wishId, entry.places]))

    placeEditValues.value = {}
    loadedPlaces.forEach((entry) => {
      entry.places.forEach((place) => {
        placeEditValues.value[place.id] = place.title
      })
    })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось загрузить данные'
  } finally {
    loading.value = false
  }
}

async function handleCreatePlace(wishId: string) {
  const value = (newPlaceTitles.value[wishId] ?? '').trim()
  if (!value) return

  loading.value = true
  errorMessage.value = ''
  try {
    const place = await createPlace(wishId, value)
    const existing = placesByWish.value[wishId] ?? []
    placesByWish.value[wishId] = [...existing, place]
    placeEditValues.value[place.id] = place.title
    newPlaceTitles.value[wishId] = ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось добавить место'
  } finally {
    loading.value = false
  }
}

async function handleUpdatePlace(wishId: string, placeId: string) {
  const value = (placeEditValues.value[placeId] ?? '').trim()
  if (!value) return

  loading.value = true
  errorMessage.value = ''
  try {
    const updated = await updatePlace(placeId, value)
    placesByWish.value[wishId] = (placesByWish.value[wishId] ?? []).map((place) =>
      place.id === placeId ? updated : place,
    )
    placeEditValues.value[placeId] = updated.title
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось обновить место'
  } finally {
    loading.value = false
  }
}

async function handleDeletePlace(wishId: string, placeId: string) {
  loading.value = true
  errorMessage.value = ''
  try {
    await deletePlace(placeId)
    placesByWish.value[wishId] = (placesByWish.value[wishId] ?? []).filter(
      (place) => place.id !== placeId,
    )
    delete placeEditValues.value[placeId]
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось удалить место'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>
